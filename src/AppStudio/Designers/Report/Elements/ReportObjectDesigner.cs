using AppBox.Reporting;
using PixUI.Diagram;

namespace AppBoxDesign;

internal abstract class ReportObjectDesigner<T> : DiagramItem, IReportItemDesigner where T : ReportItemBase
{
    public T ReportItem { get; protected init; } = null!;

    public virtual bool IsTableCell => false;

    public virtual string TypeName => ReportItem.GetType().Name;

    internal ReportRootDesigner? GetRootDesigner()
    {
        DiagramItem? temp = this;
        while (temp != null)
        {
            if (temp is ReportRootDesigner rootDesigner)
                return rootDesigner;
            temp = temp.Parent;
        }

        return null;
    }

    public virtual IEnumerable<DiagramPropertyGroup> GetProperties()
    {
        yield break;
    }

    ReportItemBase IReportItemDesigner.ReportItem => ReportItem;

    void IReportItemDesigner.Invalidate() => Invalidate();
}