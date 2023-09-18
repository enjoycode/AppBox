using System;
using System.Collections.Generic;
using System.Linq;
using LiveCharts;
using LiveChartsCore;
using PixUI;
using PixUI.Dynamic;
using Axis = LiveCharts.Axis;

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
    private AxisSettings[]? _xAxes;
    private AxisSettings[]? _yAxes;


    public CartesianSeriesSettings[]? Series
    {
        get => _series;
        set
        {
            _series = value;
            OnSeriesChanged();
        }
    }

    public AxisSettings[]? XAxes
    {
        get => _xAxes;
        set
        {
            _xAxes = value;
            OnAxesChanged(true);
        }
    }

    public AxisSettings[]? YAxes
    {
        get => _yAxes;
        set
        {
            _yAxes = value;
            OnAxesChanged(false);
        }
    }

    private async void OnAxesChanged(bool isX)
    {
        if (!IsMounted) return;

        Axis[] axes;
        if (isX)
        {
            if (_xAxes == null)
                axes = Array.Empty<Axis>();
            else
            {
                var dynamicView = FindParent(w => w is IDynamicView) as IDynamicView;
                if (dynamicView == null)
                    throw new NotImplementedException();

                axes = new Axis[_xAxes.Length];
                for (var i = 0; i < axes.Length; i++)
                {
                    axes[i] = await _xAxes[i].Buid(dynamicView);
                }
            }

            _chart.XAxes = axes;
        }
        else
        {
            if (_yAxes == null)
                axes = Array.Empty<Axis>();
            else
            {
                var dynamicView = FindParent(w => w is IDynamicView) as IDynamicView;
                if (dynamicView == null)
                    throw new NotImplementedException();

                axes = new Axis[_yAxes.Length];
                for (var i = 0; i < axes.Length; i++)
                {
                    axes[i] = await _yAxes[i].Buid(dynamicView);
                }
            }

            _chart.YAxes = axes;
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
        if (_xAxes != null) OnAxesChanged(true);
        if (_yAxes != null) OnAxesChanged(false);
    }

    private static IEnumerable<ISeries> MakeMockSeries() =>
        new ISeries[] { new ColumnSeries<float>() { Values = new float[] { 1, 2, 3, 4, 5, 6 } } };
}