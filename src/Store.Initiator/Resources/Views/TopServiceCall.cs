using PixUI.LiveCharts;
using PixUI.LiveCharts.Painting;
using PixUI.LiveCharts.VisualElements;
using LiveChartsCore;
using LiveChartsCore.Measure;
using AppBoxCore.Metrics;

namespace sys.Views;

public sealed class TopServiceCall : View
{
    public static Widget Preview() => new Container { FillColor = Colors.Black, Child = new TopServiceCall() };

    public TopServiceCall()
    {
        Child = new PieChart()
        {
            Title = new LabelVisual() { Text = "Top Service Call", TextSize = 15, Paint = WhitePaint },
            LegendPosition = LegendPosition.Right,
            LegendTextPaint = WhitePaint,
            LegendTextSize = 11,
        }
        .RefBy(ref _chart!);
    }

    public DateTime StartTime { get; set; } = DateTime.Now.AddHours(-4);
    public DateTime EndTime { get; set; } = DateTime.Now;
    public int Top { get; set; } = 5;
    public float Quantile { get; set; } = 0.95f;
    private PieChart _chart;
    private readonly SolidColorPaint WhitePaint = new SolidColorPaint(Colors.White);

    protected override void OnMounted() => BuildChart();

    private async void BuildChart()
    {
        try
        {
            var range = (int)((EndTime - StartTime).TotalSeconds);
            var qml = $"topk({Top}, histogram_quantile({Quantile}, sum by (Method, le) (rate(InvokeDuration_bucket[{range}s]))))";
            var data = await sys.Services.PrometheusService.Query(qml, EndTime);
            _chart.Series = BuildPieSeries(data);
        }
        catch (Exception ex)
        {
            Notification.Error(ex.Message);
        }
    }

    private IEnumerable<ISeries> BuildPieSeries(List<VectorResult> data)
    {
        var list = new List<ISeries>();
        foreach (var vector in data)
        {
            var series = new PieSeries<double>()
            {
                Name = vector.Metric["Method"],
                Values = [vector.Value.Value],
                ToolTipLabelFormatter = p => $"{p.Coordinate.PrimaryValue:F1}ms",
                //ShowDataLabels = true,
            };
            list.Add(series);
        }
        return list;
    }
}