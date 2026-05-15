using PixUI;
using PixUI.Diagram;
using Path = PixUI.Path;

namespace AppBoxDesign;

internal static class ActivityPainter
{
    static ActivityPainter()
    {
        StartArrowPath = CreateArrowPath();
    }

    private static readonly IPath StartArrowPath;
    private static readonly Color BorderColor = 0xFF0A3210;
    private static readonly Color FillColor = 0xFF28C840;
    private static readonly Color TextColor = Colors.Black;
    internal static readonly Color ConnectionBackColor = 0xFF006400;
    internal static readonly Color ConnectionLineColor = 0xFF2196F3;
    internal const float ConnectionThickness = 2f;
    private const float BorderWidth = 1.5f;

    private static IPath CreateArrowPath()
    {
        var path = Path.Create();
        path.MoveTo(10, 5);
        path.LineTo(25, 15);
        path.LineTo(10, 25);
        path.Close();
        return path;
    }

    private static IPath CreateDecisionPath(Size size)
    {
        var topPoint = new Point(size.Width / 2f, 0f);
        var leftPoint = new Point(0f, size.Height / 2f);
        var bottomPoint = new Point(size.Width / 2f, size.Height);
        var rightPoint = new Point(size.Width, size.Height / 2f);

        var path = Path.Create();
        path.MoveTo(topPoint.X, topPoint.Y);
        path.LineTo(leftPoint.X, leftPoint.Y);
        path.LineTo(bottomPoint.X, bottomPoint.Y);
        path.LineTo(rightPoint.X, rightPoint.Y);
        path.Close();
        return path;
    }

    public static void PaintStartActivity(ICanvas canvas, Size size)
    {
        var rect = Rect.FromLS(Point.Empty, size);
        canvas.FillEllipse(FillColor, rect);
        canvas.DrawEllipse(BorderColor, BorderWidth, rect);
        canvas.FillPath(Colors.White, StartArrowPath);
    }

    public static void PaintDecisionActivity(ICanvas canvas, Size size, string title)
    {
        using var path = CreateDecisionPath(size);
        canvas.FillPath(FillColor, path);
        canvas.DrawPath(BorderColor, BorderWidth, path);

        if (!string.IsNullOrEmpty(title))
        {
            var para = TextPainter.BuildParagraph(title, size.Width, 12,
                TextColor, null, 2, true, TextAlign.Center);
            var textWidth = para.LongestLine;
            var textHeight = para.Height;
            var x = (size.Width - textWidth) / 2f;
            var y = (size.Height - textHeight) / 2f;
            canvas.DrawParagraph(para, x, y);
        }
    }
}