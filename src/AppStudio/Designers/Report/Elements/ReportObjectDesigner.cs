using AppBox.Reporting;
using PixUI.Diagram;

namespace AppBoxDesign;

internal abstract class ReportObjectDesigner<T> : DiagramItem, IReportItemDesigner where T : ReportItemBase
{
    public T ReportItem { get; protected init; } = null!;

    ReportItemBase IReportItemDesigner.ReportItem => ReportItem;

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

    void IReportItemDesigner.Invalidate() => Invalidate();
}