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

            var runtimeSeries = new ISeries[_series.Length];
            for (var i = 0; i < _series.Length; i++)
            {
                runtimeSeries[i] = await _series[i].Build(dynamicView);
            }

            _chart.Series = runtimeSeries;
        }
    }

    protected override void OnMounted()
    {
        base.OnMounted();

        if (_series != null /*&& _chart.Series == null*/)
            OnSeriesChanged();
    }
}