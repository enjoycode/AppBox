using PixUI;
using PixUI.Diagram;
using Path = PixUI.Path;

namespace AppBoxDesign;

internal static class ActivityPainter
{
    private static readonly IPath AutomationIconPath = CreateAutomationIconPath();
    private static readonly IPath SingleHumanIconPath = CreateSingleHumanIconPath();
    private static readonly IPath MultiHumanIconPath = CreateMultiHumanIconPath();
    private static readonly IPath StartArrowPath = CreateArrowPath();
    private static readonly IPath ForkIconPath = CreateForkIconPath();
    private static readonly IPath JoinIconPath = CreateJoinIconPath();
    private static readonly Color BorderColor = 0xFF0A3210;
    private static readonly Color FillColor = 0xFF28C840;
    private static readonly Color DecisionFillColor = 0xFF00A3E7;
    private static readonly Color HumanFillColor = 0xFFC3E4F3;
    private static readonly Color AutomationFillColor = 0xFF6AA8DD;
    private static readonly Color TextColor = Colors.Black;
    private static readonly Color IconColor = BorderColor;
    internal static readonly Color ConnectionBackColor = 0xFF006400;
    internal static readonly Color ConnectionLineColor = 0xFF2196F3;
    internal const float ConnectionThickness = 2f;
    private const float BorderWidth = 1.5f;
    private const float IconOffsetX = 18f;

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

    private static IPath CreateAutomationIconPath()
    {
        var path = Path.ParseSvgPathData(
            "M332-340h54l30-82h128l30 82h56L508-660h-56L332-340Zm100-128 46-132h4l46 132h-96ZM324-111.5Q251-143 197-197t-85.5-127Q80-397 80-480q0-43 9-84.5t26-80.5l62 62q-8 26-12.5 51.5T160-480q0 134 93 227t227 93q134 0 227-93t93-227q0-134-93-227t-227-93q-27 0-52.5 4.5T377-783l-61-61q40-18 80-27t84-9q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80q-83 0-156-31.5Zm-146.5-586Q160-715 160-740t17.5-42.5Q195-800 220-800t42.5 17.5Q280-765 280-740t-17.5 42.5Q245-680 220-680t-42.5-17.5ZM310-650q70-70 170-70t170 70q70 70 70 170t-70 170q-70 70-170 70t-170-70q-70-70-70-170t70-170Z");
        path.Transform(Matrix3.CreateScale(0.026f, 0.026f));
        return path;
    }

    private static IPath CreateSingleHumanIconPath()
    {
        var path = Path.ParseSvgPathData(
            "M367-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z");
        path.Transform(Matrix3.CreateScale(0.026f, 0.026f));
        return path;
    }

    private static IPath CreateMultiHumanIconPath()
    {
        var path = Path.ParseSvgPathData(
            "M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM247-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47Zm466 0q-47 47-113 47-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113q0 66-47 113Z");
        path.Transform(Matrix3.CreateScale(0.024f, 0.026f));
        return path;
    }

    private static IPath CreateForkIconPath()
    {
        var path = Path.ParseSvgPathData(
            "M14 4l2.29 2.29l-2.88 2.88l1.42 1.42l2.88-2.88L20 10V4zm-4 0H4v6l2.29-2.29l4.71 4.7V20h2v-8.41l-5.29-5.3z");
        path.Transform(Matrix3.CreateScale(0.8f, 0.8f));
        path.Transform(Matrix3.CreateRotationDegrees(90));
        return path;
    }

    private static IPath CreateJoinIconPath()
    {
        var path = Path.ParseSvgPathData(
            "M17 20.41L18.41 19L15 15.59L13.59 17L17 20.41zM7.5 8H11v5.59L5.59 19L7 20.41l6-6V8h3.5L12 3.5L7.5 8z");
        path.Transform(Matrix3.CreateScale(0.8f, 0.8f));
        path.Transform(Matrix3.CreateRotationDegrees(90));
        return path;
    }

    private static void PaintTitle(ICanvas canvas, Size size, string title, float offsetX, float offsetY)
    {
        using var para = TextPainter.BuildParagraph(title, size.Width, 12,
            TextColor, null, 2, true, TextAlign.Center);
        // var textWidth = para.LongestLine;
        var textHeight = para.Height;
        var x = /*(size.Width - textWidth) / 2f +*/ offsetX;
        var y = (size.Height - textHeight) / 2f + offsetY;
        canvas.DrawParagraph(para, x, y);
    }

    public static void PaintStartActivity(ICanvas canvas, Size size)
    {
        var rect = Rect.FromLS(Point.Empty, size);
        canvas.FillEllipse(FillColor, rect);
        canvas.DrawEllipse(BorderColor, BorderWidth, rect);
        canvas.FillPath(BorderColor, StartArrowPath);
    }

    public static void PaintDecisionActivity(ICanvas canvas, Size size, string title)
    {
        using var path = CreateDecisionPath(size);
        canvas.FillPath(DecisionFillColor, path);
        canvas.DrawPath(BorderColor, BorderWidth, path);

        if (!string.IsNullOrEmpty(title))
            PaintTitle(canvas, size, title, 0, 0);
    }

    private static void PaintIcon(ICanvas canvas, IPath icon, Size size, float offsetX, float offsetY, Color color)
    {
        const float iconHeight = 36f;
        var x = offsetX;
        var y = (size.Height - iconHeight) / 2f + offsetY;
        canvas.Translate(x, y);
        canvas.FillPath(color, icon);
        canvas.Translate(-x, -y);
    }

    public static void PaintAutomationActivity(ICanvas canvas, Size size, string title)
    {
        var radius = size.Height / 2f;
        var rect = Rect.FromLS(Point.Empty, size);
        canvas.FillRoundRectangle(AutomationFillColor, rect, radius, radius);
        canvas.DrawRoundRectangle(BorderColor, rect, radius, radius, BorderWidth);

        PaintIcon(canvas, AutomationIconPath, size, 0, 30, IconColor);

        if (!string.IsNullOrEmpty(title))
        {
            var textSize = new Size(size.Width - IconOffsetX, size.Height);
            PaintTitle(canvas, textSize, title, IconOffsetX, 1);
        }
    }

    private static void PaintHumanActivity(ICanvas canvas, Size size, string title, bool isSingleHuman)
    {
        var radius = 5f;
        var rect = Rect.FromLS(Point.Empty, size);
        canvas.FillRoundRectangle(HumanFillColor, rect, radius, radius);
        canvas.DrawRoundRectangle(BorderColor, rect, radius, radius, BorderWidth);

        PaintIcon(canvas, isSingleHuman ? SingleHumanIconPath : MultiHumanIconPath, size, isSingleHuman ? 0 : 1, 30,
            IconColor);

        if (!string.IsNullOrEmpty(title))
        {
            var textSize = new Size(size.Width - IconOffsetX, size.Height);
            PaintTitle(canvas, textSize, title, IconOffsetX, 1);
        }
    }

    public static void PaintSingleHumanActivity(ICanvas canvas, Size size, string title) =>
        PaintHumanActivity(canvas, size, title, true);

    public static void PaintMultiHumanActivity(ICanvas canvas, Size size, string title) =>
        PaintHumanActivity(canvas, size, title, false);

    public static void PaintForkActivity(ICanvas canvas, Size size, string title)
    {
        var rect = Rect.FromLS(Point.Empty, new Size(size.Width * 2, size.Height));
        using var harfCircle = Path.Create();
        harfCircle.AddArc(rect, 90, 180);
        harfCircle.LineTo(rect.MidX, rect.MidY);
        harfCircle.Close();

        canvas.FillPath(BorderColor, harfCircle);
        // canvas.DrawPath(BorderColor, BorderWidth, harfCircle);

        PaintIcon(canvas, ForkIconPath, size, 17f, 8f, Colors.White);
    }

    public static void PaintJoinActivity(ICanvas canvas, Size size, string title)
    {
        var rect = Rect.FromLS(new Point(-size.Width, 0), new Size(size.Width * 2, size.Height));
        using var harfCircle = Path.Create();
        harfCircle.AddArc(rect, 270, 180);
        harfCircle.LineTo(rect.MidX, rect.MidY);
        harfCircle.Close();

        canvas.FillPath(BorderColor, harfCircle);
        // canvas.DrawPath(BorderColor, BorderWidth, harfCircle);

        PaintIcon(canvas, JoinIconPath, size, 17f, 8f, Colors.White);
    }
}