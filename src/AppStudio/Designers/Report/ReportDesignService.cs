using PixUI.Diagram;

namespace AppBoxDesign;

internal sealed class ReportDesignService
{
    public ReportDesignService()
    {
        Surface.SelectionService.SelectionChanged += OnSelectionChanged;
    }

    internal DiagramView DiagramView { get; } = new();
    internal DiagramSurface Surface => DiagramView.Surface;
    internal DiagramPropertyPanel PropertyPanel { get; } = new();

    private void OnSelectionChanged(object? sender, EventArgs e)
    {
        //TODO: 考虑没有选择项时默认选择ReportRootDesigner
        var itemDesigner = Surface.SelectionService.HasSelectedItem
            ? Surface.SelectionService.SelectedItems[0] as IDiagramItem
            : null;
        PropertyPanel.OnSelectedItem(itemDesigner);
    }

    public void DeleteSelection()
    {
        var selection = Surface.SelectionService.SelectedItems;
        if (selection.Length == 0) return;

        foreach (var item in selection)
        {
            if (item is IReportItemDesigner { IsTableCell: false })
            {
                item.Parent?.RemoveItem(item);
            }
        }

        Surface.SelectionService.ClearSelection();
        Surface.Repaint(); //TODO:考虑合并重绘区域，暂全部刷新
    }
}