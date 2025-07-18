using AppBox.Reporting;
using PixUI.Diagram;

namespace AppBoxDesign;

internal interface IReportItemDesigner : IDiagramItem, IDiagramItemWithProperties
{
    ReportItemBase ReportItem { get; }
}