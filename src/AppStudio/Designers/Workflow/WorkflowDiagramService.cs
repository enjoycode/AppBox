using AppBoxClient;
using AppBoxCore;
using AppBoxDesign.Diagram;
using AppBoxStore.Entities;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using PixUI;
using PixUI.Diagram;

namespace AppBoxDesign;

internal sealed class WorkflowDiagramService : IDiagramService
{
    public WorkflowDiagramService(DesignContext designContext, WorkflowModel workflowModel)
    {
        _designContext = designContext;
        PropertyPanel = new DiagramPropertyPanel(designContext);
        _rootDesigner = new WorkflowRootDesigner(workflowModel);
    }

    private readonly WorkflowRootDesigner _rootDesigner;
    private readonly DesignContext _designContext;
    internal WorkflowModel WorkflowModel => _rootDesigner.WorkflowModel;
    internal DiagramSurface Surface { get; private set; } = null!;
    internal WorkflowToolbox Toolbox { get; } = new();

    internal DiagramPropertyPanel PropertyPanel { get; }

    void IDiagramService.InitSurface(DiagramSurface surface)
    {
        if (Surface != null!)
            throw new Exception("Surface is already set");

        Surface = surface;
        Surface.ToolboxService.Toolbox = Toolbox;
        Surface.RoutingService.Router = new AStarRouter(surface) { AvoidShapes = true };
        Surface.SelectionService.SelectionChanged += OnSelectionChanged;
    }

    private void OnSelectionChanged(object? sender, EventArgs e)
    {
        var itemDesigner = Surface.SelectionService.HasSelection
            ? Surface.SelectionService.SelectedItems[0] as IDiagramItem
            : _rootDesigner;
        PropertyPanel.OnSelectedItem(itemDesigner);
    }

    internal void OnLoaded() => OnSelectionChanged(null, EventArgs.Empty);

    public void MoveSelection(Offset delta)
    {
        //var selectedItems = Surface.SelectionService.SelectedItems.ToArray(); //Maybe changed
        var selectedItems = Surface.SelectionService.SelectedItems;
        foreach (var item in selectedItems)
        {
            item.Move(delta);
        }
    }

    public void DeleteSelection()
    {
        var selection = Surface.SelectionService.SelectedItems;
        if (selection.Count == 0) return;

        foreach (var item in selection)
        {
            if (item is ActivityDesigner { Node: not StartNode } or ActivityConnection)
                Surface.RemoveItem(item);
        }

        Surface.SelectionService.ClearSelection();
        Surface.Repaint(); //TODO:考虑合并重绘区域，暂全部刷新
    }

    internal void SelectNode(ActivityNode node)
    {
        var item = Surface.GetShapes().Cast<ActivityDesigner>()
            .FirstOrDefault(r => r.Node == node);
        if (item != null)
            Surface.SelectionService.SelectItem(item);
    }

    /// <summary>
    /// 同步所有连接线的点用于运行时绘制
    /// </summary>
    internal void SyncFlowLinkPoints()
    {
        foreach (var connection in Surface.GetConnections().Cast<ActivityConnection>())
        {
            var link = connection.Link;
            if (link == null) continue;

            link.LineType = (FlowLink.ConnectionType)((byte)connection.ConnectionType);
            var count = connection.ConnectionPoints.Count + 2;
            var index = 0;
            link.Points = new float[count * 2];

            //StartPoint
            link.Points[index++] = connection.EndPoint.X;
            link.Points[index++] = connection.StartPoint.Y;

            //Intermedia Points
            foreach (var point in connection.ConnectionPoints)
            {
                link.Points[index++] = point.X;
                link.Points[index++] = point.Y;
            }

            //EndPoint
            link.Points[index++] = connection.EndPoint.X;
            link.Points[index] = connection.EndPoint.Y;
        }
    }

    #region ====Cache Methods====

    internal IList<OrgUnit> OrgUnitsTree { get; private set; } = null!;
    internal Dictionary<string, string> WorkflowActorMethods { get; private set; } = null!;

    internal void SetHumanActorDisplayName(HumanNode humanNode)
    {
        foreach (var actor in humanNode.Actors)
        {
            switch (actor.Source)
            {
                case HumanActor.ActorSource.FromAssigned:
                    actor.DisplayName = GetOrgUnitName(actor.AssignedOrgUnitId);
                    break;
                case HumanActor.ActorSource.FromWorkflowActorService:
                    actor.DisplayName = GetActorMethodDisplayName(actor.ActorServiceMethodName);
                    break;
                default:
                    actor.DisplayName = "[表达式]";
                    break;
            }
        }
    }

    internal async Task InitCache()
    {
        OrgUnitsTree = (await Channel.Invoke<IList<OrgUnit>>("sys.OrgUnitService.LoadTree",
            [new EntityFactory(OrgUnit.MODELID, typeof(OrgUnit))]))!;
        WorkflowActorMethods = await GetWorkflowActorServiceMethods(_designContext);
    }

    private static async Task<Dictionary<string, string>> GetWorkflowActorServiceMethods(DesignContext ctx)
    {
        var serviceNode = ctx.DesignTree.FindModelNodeByFullName("sys.Services.WorkflowActorService");
        if (serviceNode == null) return [];

        var srcProject = ctx.Workspace.CurrentSolution.GetProject(serviceNode.ServiceProjectId);
        var srcDocument = srcProject!.GetDocument(serviceNode.RoslynDocumentId!)!;
        var syntaxTree = await srcDocument.GetSyntaxTreeAsync();
        if (syntaxTree == null) return [];

        var classDeclarations = (await syntaxTree.GetRootAsync())
            .DescendantNodes()
            .OfType<ClassDeclarationSyntax>()
            .FirstOrDefault(n => n.Identifier.Text == "WorkflowActorService");
        if (classDeclarations == null) return [];

        var methods = classDeclarations
            .DescendantNodes()
            .OfType<MethodDeclarationSyntax>();
        var result = new Dictionary<string, string>();
        foreach (var method in methods)
        {
            if (CheckIsWorkflowActorMethod(method, out var displayName))
                result[method.Identifier.Text] = displayName;
        }

        return result;
    }

    private static bool CheckIsWorkflowActorMethod(MethodDeclarationSyntax node, out string displayName)
    {
        //TODO: should check is public
        var attribute = TypeHelper.TryGetAttribute(node.AttributeLists, static a =>
        {
            const string shortName = "WorkflowActor";
            var name = a.Name.ToString();
            if (name == shortName) return true;

            return name is $"{shortName}Attribute" or $"AppBoxCore.{shortName}" or $"AppBoxCore.{shortName}Attribute";
        });
        if (attribute == null)
        {
            displayName = string.Empty;
            return false;
        }

        var arg = (AttributeArgumentSyntax)attribute.ArgumentList!.ChildNodes().First();
        displayName = ((LiteralExpressionSyntax)arg.Expression).Token.ValueText;
        return true;
    }

    private static IEnumerable<OrgUnit> Flatten(OrgUnit? node)
    {
        if (node == null)
            yield break;

        yield return node;

        foreach (var child in node.Children.SelectMany(Flatten))
        {
            yield return child;
        }
    }

    private string GetOrgUnitName(Guid ouid)
    {
        foreach (var ou in OrgUnitsTree)
        {
            var found = Flatten(ou).FirstOrDefault(t => t.Id == ouid);
            if (found != null)
                return found.Name;
        }

        return "[已删除]";
    }

    private string GetActorMethodDisplayName(string methodName) =>
        WorkflowActorMethods.GetValueOrDefault(methodName, "[已删除]");

    #endregion
}