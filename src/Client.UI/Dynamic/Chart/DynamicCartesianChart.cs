using System;
using System.Threading.Tasks;
using AppBoxCore;
using LiveCharts;
using LiveChartsCore;
using PixUI;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic;

public sealed class DynamicCartesianChart : SingleChildWidget
{
    public DynamicCartesianChart()
    {
        _chart = new CartesianChart();
        Child = _chart;
    }

    private readonly CartesianChart _chart;
    private CartesianSeriesSettings[]? _series;

    public CartesianSeriesSettings[]? Series
    {
        get => _series;
        set
        {
            _series = value;
            OnSeriesChanged();
        }
    }

    private async void OnSeriesChanged()
    {
        if (!IsMounted) return;

        if (_series != null)
        {
            var dynamicView = FindParent(w => w is IDynamicView) as IDynamicView;
            if (dynamicView == null)
                throw new NotImplementedException();

            var runtimeSeries = new ISeries<DynamicEntity>[_series.Length];
            for (var i = 0; i < _series.Length; i++)
            {
                if (_series[i] is LineSeriesSettings line)
                {
                    runtimeSeries[i] = await BuildLineSeries(line, dynamicView);
                }
                else
                {
                    throw new NotImplementedException();
                }
            }

            _chart.Series = runtimeSeries;
        }
    }

    private static async ValueTask<ISeries<DynamicEntity>> BuildLineSeries(LineSeriesSettings line,
        IDynamicView dynamicView)
    {
        var res = new LineSeries<DynamicEntity>
        {
            Name = line.Name ?? line.FieldName,
            Values = (DynamicDataSet?)(await dynamicView.GetDataSet(line.DataSetName)),
            Mapping = (obj, point) =>
            {
                var v = obj[line.FieldName].ToDouble();
                if (v.HasValue)
                {
                    point.PrimaryValue = v.Value;
                    point.SecondaryValue = point.Context.Entity.EntityIndex;
                }
            }
        };

        return res;
    }

    protected override void OnMounted()
    {
        base.OnMounted();

        if (_series != null /*&& _chart.Series == null*/)
            OnSeriesChanged();
    }
}