using PixUI.Diagram;

namespace AppBoxDesign;

internal sealed class ReportDesignService : IDesignService
{
    internal ReportToolbox Toolbox { get; } = new();
    internal DiagramSurface Surface { get; private set; } = null!;
    internal DiagramPropertyPanel PropertyPanel { get; } = new();

    void IDesignService.InitSurface(DiagramSurface surface)
    {
        if (Surface != null!)
            throw new Exception("Surface is already set");

        Surface = surface;
        Surface.ToolboxService.Toolbox = Toolbox;
        Surface.SelectionService.SelectionChanged += OnSelectionChanged;
    }

    private void OnSelectionChanged(object? sender, EventArgs e)
    {
        //TODO: 考虑没有选择项时默认选择ReportRootDesigner
        var itemDesigner = Surface.SelectionService.HasSelection
            ? Surface.SelectionService.SelectedItems[0] as IDiagramItem
            : null;
        PropertyPanel.OnSelectedItem(itemDesigner);
    }

    public void DeleteSelection()
    {
        var selection = Surface.SelectionService.SelectedItems;
        if (selection.Count == 0) return;

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

    void IDesignService.MoveSelection(int deltaX, int deltaY)
    {
        var selectedItems = Surface.SelectionService.SelectedItems;
        //TODO: 先判断有没有不能Move的对象，有则全部不允许移动
        // foreach (var item in selectedItems)
        // {
        //     if((item.DesignBehavior & DesignBehavior.CanMove) != DesignBehavior.CanMove)
        //         return;
        // }

        //再处理移动所有选择的对象
        foreach (var item in selectedItems)
            item.Move(deltaX, deltaY);
    }
}