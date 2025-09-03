using AppBox.Reporting;
using AppBox.Reporting.Drawing;
using AppBoxDesign.Diagram.PropertyEditors;
using PixUI;
using PixUI.Diagram;

namespace AppBoxDesign;

internal sealed class ReportSectionDesigner : ReportObjectDesigner<ReportSectionBase>
{
    public ReportSectionDesigner(ReportSectionBase section)
    {
        ReportItem = section;
    }

    protected override bool IsContainer => true;

    public float Y { get; internal set; }

    public override DesignBehavior DesignBehavior => DesignBehavior.CanResize;

    public override Rect Bounds
    {
        get
        {
            var widthPx = ReportItem.Report.Width.FPixels;
            var heightPx = ReportItem.Height.FPixels;
            return Rect.FromLTWH(0, Y, widthPx, heightPx);
        }
        set => SetBounds(value.X, value.Y, value.Width, value.Height, BoundsSpecified.Size);
    }

    protected override void SetBounds(float x, float y, float width, float height, BoundsSpecified specified)
    {
        //获取原单位
        var unitType = ReportItem.Height.Type;
        //不允许改变宽度，改变报表宽度
        ReportItem.Height = ReportSize.FromPixels(height, unitType);

        //重新布局并刷新
        var rootDesigner = (ReportRootDesigner)Parent!;
        rootDesigner.PerformLayout();
        Surface?.Repaint();
    }

    public override void Paint(Canvas canvas)
    {
        canvas.DrawRectangle(new(173, 219, 241), 1.0f, Bounds);
        canvas.Translate(Bounds.X, Bounds.Y);

        foreach (var item in Items)
        {
            item.Paint(canvas);
        }

        canvas.Translate(-Bounds.X, -Bounds.Y);
    }

    public override IEnumerable<DiagramPropertyGroup> GetProperties()
    {
        yield return new DiagramPropertyGroup()
        {
            GroupName = "Layout",
            Properties =
            [
                new ReportDiagramProperty(this, "Height", nameof(ReportSizeEditor))
                {
                    ValueGetter = () => ReportItem.Height,
                    ValueSetter = v => ReportItem.Height = (ReportSize)v!,
                },
            ]
        };
    }
}