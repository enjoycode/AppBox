using AppBox.Reporting;
using AppBoxDesign.Diagram;
using PixUI;

namespace AppBoxDesign.Reporting;

/// <summary>
/// 用于编辑IDataItem.DataSource属性
/// </summary>
internal sealed class ReportDataSourceEditor : SingleChildWidget
{
    public ReportDataSourceEditor(IDiagramProperty propertyItem)
    {
        var reportItem = (IReportItemDesigner)propertyItem.DiagramItem;
        var table = (Table)reportItem.ReportItem;
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