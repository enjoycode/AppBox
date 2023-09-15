using System;
using System.Collections.Generic;
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
        else
        {
            _chart.Series = MakeMockSeries();
        }
    }

    protected override void OnMounted()
    {
        base.OnMounted();

        if (Parent is IDesignElement)
            _chart.EasingFunction = null; //disable animation in design time

        OnSeriesChanged();
    }

    private static IEnumerable<ISeries> MakeMockSeries() =>
        new ISeries[] { new ColumnSeries<float>() { Values = new float[] { 1, 2, 3, 4, 5, 6 } } };
}