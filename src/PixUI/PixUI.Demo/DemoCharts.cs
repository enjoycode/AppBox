using LiveChartsCore;
using LiveChartsCore.Drawing;
using LiveChartsCore.SkiaSharpView;
using LiveChartsCore.SkiaSharpView.Painting;
using LiveChartsCore.SkiaSharpView.VisualElements;
using PixLiveCharts;

namespace PixUI.Demo;

public sealed class DemoCharts : View
{
    private ISeries[] series =
    {
        new LineSeries<float>
        {
            Values = new float[] { 2, 1, 3, 5, 3, 4, 6 },
            Fill = null
        }
    };

    private LabelVisual title = new LabelVisual()
    {
        Text = "My Chart Title",
        TextSize = 25,
        Padding = new Padding(15),
        Paint = new SolidColorPaint(Colors.Gray)
    };

    public DemoCharts()
    {
        Child = new Card
        {
            Child = new CartesianChart
            {
                Series = series,
                //Title = title,
                Width = 400,
                Height = 300,
            }
        };
    }
}