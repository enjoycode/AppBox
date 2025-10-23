using AppBox.Reporting;
using AppBox.Reporting.Drawing;
using AppBoxDesign.Diagram.PropertyEditors;
using PixUI;
using PixUI.Diagram;
using Colors = PixUI.Colors;

namespace AppBoxDesign;

internal sealed class ReportRootDesigner : ReportObjectDesigner<Report>
{
    public ReportRootDesigner(ReportDesignService designService, Report report)
    {
        ReportItem = report;
        DesignService = designService;
    }

    public ReportDesignService DesignService { get; }

    public override DesignBehavior DesignBehavior => DesignBehavior.None;

    protected override bool IsContainer => true;

    public override Rect Bounds
    {
        get
        {
            var widthPx = ReportItem.Width.FPixels;
            var heightPx = ReportItem.Items.Cast<ReportSectionBase>()
                .Aggregate(0f, (current, section) => current + section.Height.FPixels);

            return Rect.FromLTWH(8, 8, widthPx, heightPx);
        }
        set
        {
            //do nothing
        }
    }

    protected override void SetBounds(float x, float y, float width, float height, BoundsSpecified specified)
    {
        //do nothing
    }

    public override void Paint(Canvas canvas)
    {
        var bounds = Bounds;
        var clientRect = Rect.FromLTWH(0, 0, bounds.Width, bounds.Height);
        canvas.FillRectangle(Colors.White, clientRect);
        canvas.DrawRectangle(new(173, 219, 241), 1.0f, clientRect);

        foreach (var item in Items)
        {
            item.Paint(canvas);
        }
    }

    internal void PerformLayout()
    {
        float offsetY = 0;
        foreach (var section in GetSectionsOrdered(ReportItem))
        {
            var designer = (ReportSectionDesigner)Items.Single(t =>
            {
                var sectionDesigner = (ReportSectionDesigner)t;
                return ReferenceEquals(sectionDesigner.ReportItem, section);
            });
            designer.Y = offsetY;
            offsetY += section.Height.FPixels;
        }
    }

    private static IEnumerable<ReportSectionBase> GetSectionsOrdered(Report report)
    {
        ReportSectionBase? section;

        if (null != (section = report.FindFirstChild<PageHeader>()))
            yield return section;

        if (null != (section = report.FindFirstChild<ReportHeader>()))
            yield return section;

        for (var i = 0; i < report.Groups.Count; i++)
        {
            if (null != (section = report.Groups[i].GroupHeader))
                yield return section;
        }

        if (null != (section = report.FindFirstChild<Details>()))
            yield return section;

        for (var i = report.Groups.Count - 1; i >= 0; i--)
        {
            if (null != (section = report.Groups[i].GroupFooter))
                yield return section;
        }

        if (null != (section = report.FindFirstChild<ReportFooter>()))
            yield return section;

        if (null != (section = report.FindFirstChild<PageFooter>()))
            yield return section;
    }

    public override IEnumerable<DiagramPropertyGroup> GetProperties()
    {
        yield return new DiagramPropertyGroup()
        {
            GroupName = "Properties",
            Properties =
            [
                new ReportDiagramProperty(this, "PaperWidth", nameof(ReportScalarEditor))
                {
                    ValueGetter = () => ReportItem.PageSettings.PaperSize.Width,
                    ValueSetter = v =>
                    {
                        var oldSize = ReportItem.PageSettings.PaperSize;
                        ReportItem.PageSettings.PaperSize = new RSize((Scalar)v!, oldSize.Height);
                        ReportItem.ResetWidth();
                    },
                },
                new ReportDiagramProperty(this, "PaperHeight", nameof(ReportScalarEditor))
                {
                    ValueGetter = () => ReportItem.PageSettings.PaperSize.Height,
                    ValueSetter = v =>
                    {
                        var oldSize = ReportItem.PageSettings.PaperSize;
                        ReportItem.PageSettings.PaperSize = new RSize(oldSize.Width, (Scalar)v!);
                    }
                },
                new ReportDiagramProperty(this, "DataSources", nameof(ReportDataSourcesEditor))
                {
                    ValueGetter = () => ReportItem.DataSources,
                }
            ]
        };
    }
}