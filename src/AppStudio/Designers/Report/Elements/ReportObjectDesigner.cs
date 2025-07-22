using AppBox.Reporting;
using PixUI.Diagram;

namespace AppBoxDesign;

internal abstract class ReportObjectDesigner<T> : DiagramItem, IReportItemDesigner where T : ReportItemBase
{
    public T ReportItem { get; protected init; } = null!;

    ReportItemBase IReportItemDesigner.ReportItem => ReportItem;

    public virtual string TypeName => ReportItem.GetType().Name;

    public virtual IEnumerable<DiagramPropertyGroup> GetProperties()
    {
        yield break;
    }

    void IReportItemDesigner.Invalidate() => Invalidate();
}