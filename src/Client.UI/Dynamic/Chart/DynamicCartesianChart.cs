using System.Collections.Generic;
using AppBoxCore;
using LiveCharts;
using LiveChartsCore;
using PixUI;
using PixUI.Dynamic;
using Axis = LiveCharts.Axis;

namespace AppBoxClient.Dynamic;

public sealed class DynamicCartesianChart : SingleChildWidget, IDataSetBinder
{
    public DynamicCartesianChart()
    {
        _chart = new CartesianChart();
        Child = _chart;
    }

    private readonly CartesianChart _chart;
    private CartesianSeriesSettings[]? _series;
    private ChartAxisSettings[]? _xAxes;
    private ChartAxisSettings[]? _yAxes;

    public string? DataSet { get; set; }

    public CartesianSeriesSettings[]? Series
    {
        get => _series;
        set
        {
            _series = value;
            OnSeriesChanged();
        }
    }

    public ChartAxisSettings[]? XAxes
    {
        get => _xAxes;
        set
        {
            _xAxes = value;
            OnAxesChanged(true);
        }
    }

    public ChartAxisSettings[]? YAxes
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
            if (_xAxes == null || _xAxes.Length == 0)
            {
                axes = new[] { new Axis() };
            }
            else
            {
                if (string.IsNullOrEmpty(DataSet)) return;
                if (FindParent(w => w is IDynamicView) is not IDynamicView dynamicView) return;
                if (await dynamicView.GetDataSet(DataSet) is not DynamicDataSet dataset) return;

                axes = new Axis[_xAxes.Length];
                for (var i = 0; i < axes.Length; i++)
                {
                    axes[i] = _xAxes[i].Buid(dynamicView, dataset);
                }
            }

            _chart.XAxes = axes;
        }
        else
        {
            if (_yAxes == null || _yAxes.Length == 0)
            {
                axes = new[] { new Axis() };
            }
            else
            {
                if (string.IsNullOrEmpty(DataSet)) return;
                if (FindParent(w => w is IDynamicView) is not IDynamicView dynamicView) return;
                if (await dynamicView.GetDataSet(DataSet) is not DynamicDataSet dataset) return;

                axes = new Axis[_yAxes.Length];
                for (var i = 0; i < axes.Length; i++)
                {
                    axes[i] = _yAxes[i].Buid(dynamicView, dataset);
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
            if (string.IsNullOrEmpty(DataSet)) return;
            if (FindParent(w => w is IDynamicView) is not IDynamicView dynamicView) return;
            if (await dynamicView.GetDataSet(DataSet) is not DynamicDataSet dataset) return;

            var runtimeSeries = new ISeries[_series.Length];
            for (var i = 0; i < _series.Length; i++)
            {
                runtimeSeries[i] = _series[i].Build(dynamicView, dataset);
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

    #region ====IDataSetBinder====

    string IDataSetBinder.DataSetPropertyName => nameof(DataSet);

    void IDataSetBinder.OnDataSetChanged()
    {
        Series = null;
        XAxes = null;
        YAxes = null;
    }

    #endregion

    private static IEnumerable<ISeries> MakeMockSeries() =>
        new ISeries[] { new ColumnSeries<float>() { Values = new float[] { 1, 2, 3, 4, 5, 6 } } };
}