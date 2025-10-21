using PixUI;

namespace AppBoxDesign.Diagram.PropertyEditors;

/// <summary>
/// 报表的数据源属性编辑器
/// </summary>
internal sealed class ReportDataSourceEditor : SingleChildWidget
{
    public ReportDataSourceEditor(IDiagramProperty propertyItem)
    {
        _propertyItem = propertyItem;

        Child = new Button("...") { Width = float.MaxValue, OnTap = OnTap };
    }

    private readonly IDiagramProperty _propertyItem;

    private void OnTap(PointerEvent e) { }
}