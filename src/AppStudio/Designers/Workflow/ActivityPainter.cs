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

    private static IPath CreateArrowPath()
    {
        var path = Path.Create();
        path.MoveTo(10, 5);
        path.LineTo(25, 15);
        path.LineTo(10, 25);
        path.Close();
        return path;
    }

    public static void PaintStartActivity(ICanvas canvas, Size size)
    {
        var rect = Rect.FromLS(Point.Empty, size);
        canvas.FillEllipse(0xFF28C840, rect);
        canvas.DrawEllipse(BorderColor, 1.5f, rect);
        canvas.FillPath(Colors.White, StartArrowPath);
    }
}