using AppBox.Reporting;
using AppBoxDesign.Diagram;

namespace AppBoxDesign.Reporting;

internal interface IReportItemDesigner : IDiagramItemDesigner
{
    ReportItemBase ReportItem { get; }

    /// <summary>
    /// 当前元素是否在表格的单元格内
    /// </summary>
    bool IsTableCell { get; }
}