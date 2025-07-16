using AppBox.Reporting;
using AppBox.Reporting.Drawing;
using PixUI;
using PixUI.Diagram;

namespace AppBoxDesign;

internal sealed class ReportSectionDesigner : DiagramItem, IReportItemDesigner
{
    public ReportSectionDesigner(ReportSectionBase section)
    {
        Section = section;
    }

    public ReportItemBase ReportItem => Section;

    internal ReportSectionBase Section { get; }

    public float Y { get; internal set; }

    protected override bool IsContainer => true;

    public override DesignBehavior DesignBehavior => DesignBehavior.CanResize;

    public override Rect Bounds
    {
        get
        {
            var widthPx = Section.Report.Width.Pixels;
            var heightPx = Section.Height.Pixels;
            return Rect.FromLTWH(0, Y, widthPx, heightPx);
        }
        set => SetBounds(value.X, value.Y, value.Width, value.Height, BoundsSpecified.Size);
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

    protected override void SetBounds(float x, float y, float width, float height, BoundsSpecified specified)
    {
        //获取原单位
        var unitType = Section.Height.Type;
        //不允许改变宽度，改变报表宽度
        Section.Height = ReportSize.FromPixels(height, unitType);

        //重新布局并刷新
        var rootDesigner = (ReportRootDesigner)Parent!;
        rootDesigner.PerformLayout();
        Surface?.Repaint();
    }
}