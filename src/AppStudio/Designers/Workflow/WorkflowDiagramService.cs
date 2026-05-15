using PixUI;
using PixUI.Diagram;

namespace AppBoxDesign;

internal sealed class WorkflowDiagramService : IDiagramService
{
    public WorkflowDiagramService(DesignHub designContext)
    {
        PropertyPanel = new DiagramPropertyPanel(designContext);
    }

    internal DiagramSurface Surface { get; private set; } = null!;
    internal WorkflowToolbox Toolbox { get; } = new();

    internal DiagramPropertyPanel PropertyPanel { get; }

    void IDiagramService.InitSurface(DiagramSurface surface)
    {
        if (Surface != null!)
            throw new Exception("Surface is already set");

        Surface = surface;
        Surface.ToolboxService.Toolbox = Toolbox;
        Surface.RoutingService.Router = new OrgTreeRouter()
        {
            TreeLayoutType = TreeLayoutType.TreeDown,
            ConnectionOuterSpacing = 20
        };
        Surface.SelectionService.SelectionChanged += OnSelectionChanged;
    }

    private void OnSelectionChanged(object? sender, EventArgs e)
    {
        var itemDesigner = Surface.SelectionService.HasSelection
            ? Surface.SelectionService.SelectedItems[0] as IDiagramItem
            : null;
        PropertyPanel.OnSelectedItem(itemDesigner);
    }

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
        throw new NotImplementedException();
    }
}