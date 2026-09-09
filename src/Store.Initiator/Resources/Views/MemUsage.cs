using PixUI.LiveCharts;
using PixUI.LiveCharts.Painting;
using PixUI.LiveCharts.VisualElements;
using LiveChartsCore;
using LiveChartsCore.Defaults;
using AppBoxCore.Metrics;

namespace sys.Views;

public sealed class MemUsage : View
{
    public static Widget Preview() => new Container { FillColor = Colors.Black, Child = new MemUsage() };

    public MemUsage()
    {
        Child = new CartesianChart()
        {
            Title = new LabelVisual() { Text = "Memory Usage", Paint = WhitePaint, TextSize = 15 },
            //DrawMarginFrame = new DrawMarginFrame() { Stroke = GrayPaint },
            XAxes = [
                new DateTimeAxis(TimeSpan.FromSeconds(Step), time => time.ToString("HH:mm:ss"))
                {
                    TextSize = 9,
                    SeparatorsPaint = GrayPaint,
                    LabelsPaint = WhitePaint,
                }
            ],
            YAxes = [
                new PixUI.LiveCharts.Axis()
                {
                    TextSize = 9,
                    SeparatorsPaint = GrayPaint,
                    Labeler = FormatBytes,
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
    
    public void Refresh(DateTime start, DateTime end, int resolution)
    {
        StartTime = start;
        EndTime = end;
        Interval = Step = resolution;
        BuildChart();
    }

    private async void BuildChart()
    {
        try
        {
            var qml = $"max(max_over_time(dotnet_process_memory_working_set_bytes[{Interval}s]))";
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
            Name = "WorkingSetBytes",
            Stroke = new SolidColorPaint(0xFFB7A62E, 1),
            GeometrySize = 0,
            LineSmoothness = 0,
            Values = data[0].Values
                .Select(dp => new DateTimePoint(dp.Timestamp, dp.Value))
                .ToList(),
        };
    }

    private static string FormatBytes(double bytes)
    {
        if (bytes < 0 || bytes == double.NaN)
            return bytes.ToString();

        string[] sizes = { "B", "K", "M", "G", "T" };
        double len = bytes;
        int order = 0;

        // 每次除以 1024，直到找到合适的单位
        while (len >= 1024 && order < sizes.Length - 1)
        {
            order++;
            len /= 1024;
        }

        return $"{len:F1} {sizes[order]}";
    }

}