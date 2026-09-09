using PixUI.LiveCharts;
using PixUI.LiveCharts.Painting;
using PixUI.LiveCharts.VisualElements;
using LiveChartsCore;
using LiveChartsCore.Defaults;
using AppBoxCore.Metrics;

namespace sys.Views;

public sealed class CpuUsage : View
{
    public static Widget Preview() => new Container { FillColor = Colors.Black, Child = new CpuUsage() };

    public CpuUsage()
    {
        Child = new CartesianChart()
        {
            Title = new LabelVisual() { Text = "Cpu Usage", Paint = WhitePaint, TextSize = 15 },
            //DrawMarginFrame = new DrawMarginFrame() { Stroke = GrayPaint },
            XAxes = [
                new DateTimeAxis(TimeSpan.FromSeconds(Step), time => time.ToString("hh:mm:ss"))
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
                    Labeler = v => v.ToString("P2"),
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
            var qml = $"sum by (cpu_mode) (rate(dotnet_process_cpu_time_seconds_total[{Interval}s]))";
            var data = await sys.Services.PrometheusService.QueryRange(qml, StartTime, EndTime, Step);
            _chart.Series = [
                BuildLineSeries(data, 0),
                BuildLineSeries(data, 1),
            ];
        }
        catch (Exception ex)
        {
            Notification.Error(ex.Message);
        }
    }

    private ISeries BuildLineSeries(List<MatrixResult> data, int mode)
    {
        return new LineSeries<DateTimePoint>()
        {
            Name = data[mode].Metric["cpu_mode"],
            Stroke = new SolidColorPaint(mode == 0 ? 0xFF00A3E7 : 0xFFB7A62E, 1),
            GeometrySize = 0,
            LineSmoothness = 0,
            Values = data[mode].Values
                .Select(dp => new DateTimePoint(dp.Timestamp, dp.Value))
                .ToList(),
        };
    }

}