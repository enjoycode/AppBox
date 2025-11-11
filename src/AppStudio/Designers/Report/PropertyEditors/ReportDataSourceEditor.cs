using AppBox.Reporting;
using PixUI;

namespace AppBoxDesign.Diagram.PropertyEditors;

/// <summary>
/// 用于编辑IDataItem.DataSource属性
/// </summary>
internal sealed class ReportDataSourceEditor : SingleChildWidget
{
    public ReportDataSourceEditor(IDiagramProperty propertyItem)
    {
        var reportProperty = (ReportDiagramProperty)propertyItem;
        var table = (Table)reportProperty.ReportItemDesigner.ReportItem;
        var report = table.Report!;
        var dataSourceState = new RxProxy<IDataSource?>(
            () => table.DataSource as IDataSource,
            v => table.DataSource = v
        );

        Child = new Select<IDataSource?>(dataSourceState)
        {
            LabelGetter = ds => ds?.Name ?? string.Empty,
            Options = report.DataSources.ToArray()
        };
    }
}