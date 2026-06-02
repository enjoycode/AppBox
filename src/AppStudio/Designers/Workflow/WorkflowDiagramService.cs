using AppBoxCore;
using AppBoxDesign.Diagram;
using PixUI;
using PixUI.Diagram;

namespace AppBoxDesign;

internal sealed class WorkflowDiagramService : IDiagramService
{
    public WorkflowDiagramService(DesignHub designContext, WorkflowModel workflowModel)
    {
        PropertyPanel = new DiagramPropertyPanel(designContext);
        _rootDesigner = new WorkflowRootDesigner(workflowModel);
    }

    private readonly WorkflowRootDesigner _rootDesigner;
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
}