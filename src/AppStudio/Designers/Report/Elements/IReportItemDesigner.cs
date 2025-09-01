using AppBox.Reporting;
using PixUI.Diagram;

namespace AppBoxDesign;

internal interface IReportItemDesigner : IDiagramItem, IDiagramItemWithProperties
{
    ReportItemBase ReportItem { get; }

    /// <summary>
    /// 当前元素是否在表格的单元格内
    /// </summary>
    bool IsTableCell { get; }

    void Invalidate();
}