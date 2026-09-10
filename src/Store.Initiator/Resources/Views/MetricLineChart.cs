using PixUI.LiveCharts;
using PixUI.LiveCharts.Painting;
using PixUI.LiveCharts.VisualElements;
using LiveChartsCore;
using LiveChartsCore.Defaults;
using AppBoxCore.Metrics;

namespace sys.Views;

public sealed class MetricLineChart : View
{
    public MetricLineChart(string title, string metricName, Func<int, string> qmlBuilder, 
        Func<double, string>? yAxisLabeler = null, double? minLimit = null)
    {
        _qmlBuilder = qmlBuilder;
        _metricName = metricName;

        Child = new CartesianChart()
        {
            Title = new LabelVisual() { Text = title, Paint = WhitePaint, TextSize = 15 },
            //DrawMarginFrame = new DrawMarginFrame() { Stroke = GrayPaint },
            XAxes =
            [
                new DateTimeAxis(TimeSpan.FromSeconds(30), time => time.ToString("HH:mm:ss"))
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
                    Labeler = yAxisLabeler ?? _defaultLabeler,
                    LabelsPaint = WhitePaint,
                    MinLimit = minLimit,
                }
            ],
        }.RefBy(ref _chart!);
    }

    private CartesianChart _chart;
    private readonly Func<int, string> _qmlBuilder;
    private readonly string _metricName;
    private readonly Func<double, string> _defaultLabeler = v => v.ToString();
    private readonly SolidColorPaint GrayPaint = new SolidColorPaint(Colors.Gray, 1);
    private readonly SolidColorPaint WhitePaint = new SolidColorPaint(Colors.White);

    protected override void OnMounted() => Refresh(DateTime.Now.AddHours(-1), DateTime.Now, 30);

    public async void Refresh(DateTime startTime, DateTime endTime, int resolution)
    {
        try
        {
            var qml = _qmlBuilder(resolution);
            var data = await sys.Services.PrometheusService.QueryRange(qml, startTime, endTime, resolution);
            var series = new ISeries[data.Count];
            for (var i = 0; i < data.Count; i++)
            {
                series[i] = BuildLineSeries(data, i);
            }
            _chart.Series = series;
        }
        catch (Exception ex)
        {
            Notification.Error(ex.Message);
        }
    }

    private ISeries BuildLineSeries(List<MatrixResult> data, int index)
    {
        string name = _metricName;
        if (data[index].Metric.TryGetValue(_metricName, out var tag))
            name = tag;

        return new LineSeries<DateTimePoint>()
        {
            Name = name,
            Stroke = GetLineStroke(index),
            GeometrySize = 0,
            LineSmoothness = 0,
            Values = data[index].Values
                .Select(dp => new DateTimePoint(dp.Timestamp, dp.Value))
                .ToList(),
        };
    }

    private static SolidColorPaint GetLineStroke(int index)
    {
        Color[] colorPalette = [0xFF00A3E7, 0xFFB7A62E, Colors.Magenta, Colors.Red];
        var color = colorPalette[index % colorPalette.Length];
        return new SolidColorPaint(color, 1);
    }

}