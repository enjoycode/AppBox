using PixUI.LiveCharts;
using PixUI.LiveCharts.Painting;
using PixUI.LiveCharts.VisualElements;
using LiveChartsCore;
using LiveChartsCore.Kernel;
using LiveChartsCore.Measure;
using AppBoxCore.Metrics;

namespace sys.Views;

public sealed class MetricPieChart : View
{
    public MetricPieChart(string title, string metricName, Func<int, string> qmlBuilder, Func<ChartPoint, string> labelFormatter)
    {
        _qmlBuilder = qmlBuilder;
        _labelFormatter = labelFormatter;
        _metricName = metricName;

        Child = new PieChart()
        {
            Title = new LabelVisual() { Text = title, TextSize = 15, Paint = WhitePaint },
            LegendPosition = LegendPosition.Right,
            LegendTextPaint = WhitePaint,
            LegendTextSize = 11,
            TooltipTextSize = 10,
        }
        .RefBy(ref _chart!);
    }

    private PieChart _chart;
    private readonly Func<int, string> _qmlBuilder;
    private readonly Func<ChartPoint, string> _labelFormatter;
    private readonly string _metricName;
    private readonly SolidColorPaint WhitePaint = new SolidColorPaint(Colors.White);

    protected override void OnMounted() => Refresh(DateTime.Now.AddHours(-1), DateTime.Now);

    public async void Refresh(DateTime startTime, DateTime endTime)
    {
        try
        {
            var range = (int)((endTime - startTime).TotalSeconds);
            var qml = _qmlBuilder(range);
            var data = await sys.Services.PrometheusService.Query(qml, endTime);
            _chart.Series = BuildPieSeries(data);
        }
        catch (Exception ex)
        {
            Notification.Error(ex.Message);
        }
    }

    private IEnumerable<ISeries> BuildPieSeries(List<VectorResult> data)
    {
        var list = new List<ISeries>(data.Count);
        foreach (var vector in data)
        {
            var series = new PieSeries<double>()
            {
                Name = vector.Metric[_metricName],
                Values = [vector.Value.Value],
                ToolTipLabelFormatter = _labelFormatter,
                //ShowDataLabels = true,
            };
            list.Add(series);
        }
        return list;
    }

}