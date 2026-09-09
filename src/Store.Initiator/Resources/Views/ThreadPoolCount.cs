using PixUI.LiveCharts;
using PixUI.LiveCharts.Painting;
using PixUI.LiveCharts.VisualElements;
using LiveChartsCore;
using LiveChartsCore.Defaults;
using AppBoxCore.Metrics;

namespace sys.Views;

public sealed class ThreadPoolCount : View
{
    public static Widget Preview() => new Container { FillColor = Colors.Black, Child = new ThreadPoolCount() };

    public ThreadPoolCount()
    {
        Child = new CartesianChart()
        {
            Title = new LabelVisual() { Text = "ThreadPool Count", Paint = WhitePaint, TextSize = 15 },
            //DrawMarginFrame = new DrawMarginFrame() { Stroke = GrayPaint },
            XAxes =
            [
                new DateTimeAxis(TimeSpan.FromSeconds(Step), time => time.ToString("HH:mm:ss"))
                {
                    TextSize = 9,
                    SeparatorsPaint = GrayPaint,
                    LabelsPaint = WhitePaint,
                }
            ],
            YAxes =
            [
                new PixUI.LiveCharts.Axis()
                {
                    TextSize = 9,
                    SeparatorsPaint = GrayPaint,
                    Labeler = v => $"{v:F1}",
                    LabelsPaint = WhitePaint,
                }
            ],
        }.RefBy(ref _chart!);
    }

    public int Interval { get; set; } = 30;
    public int Step { get; set; } = 30;
    public DateTime StartTime { get; set; } = DateTime.Now.AddHours(-1);
    public DateTime EndTime { get; set; } = DateTime.Now;
    private CartesianChart _chart;
    private readonly SolidColorPaint GrayPaint = new SolidColorPaint(Colors.Gray, 1);
    private readonly SolidColorPaint WhitePaint = new SolidColorPaint(Colors.White);

    protected override void OnMounted() => BuildChart();

    private async void BuildChart()
    {
        try
        {
            var qml = $"max(max_over_time(dotnet_thread_pool_thread_count_total[{Interval}s]))";
            var data = await sys.Services.PrometheusService.QueryRange(qml, StartTime, EndTime, Step);
            _chart.Series = [BuildLineSeries(data)];
        }
        catch (Exception ex)
        {
            Notification.Error(ex.Message);
        }
    }

    private ISeries BuildLineSeries(List<MatrixResult> data)
    {
        return new LineSeries<DateTimePoint>()
        {
            Name = "ThreadPool count",
            Stroke = new SolidColorPaint(0xFF00A3E7, 1),
            GeometrySize = 0,
            LineSmoothness = 0,
            Values = data[0].Values
                .Select(dp => new DateTimePoint(dp.Timestamp, dp.Value))
                .ToList(),
        };
    }
}