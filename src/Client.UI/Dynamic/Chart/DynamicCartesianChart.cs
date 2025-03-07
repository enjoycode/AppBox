using System.Collections.Generic;
using System.Text.Json.Serialization;
using AppBoxCore;
using LiveCharts;
using LiveChartsCore;
using PixUI;
using PixUI.Dynamic;
using Axis = LiveCharts.Axis;

namespace AppBoxClient.Dynamic;

public sealed class DynamicCartesianChart : SingleChildWidget, IDataSourceBinder
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

    private string? _dataSource;
    [JsonIgnore] private IDynamicContext? _dynamicContext;

    public string? DataSource
    {
        get => _dataSource;
        set
        {
            //设计时改变了重置并取消监听数据集变更
            if (IsMounted && !string.IsNullOrEmpty(_dataSource))
            {
                Series = null;
                XAxes = null;
                YAxes = null;
                _dynamicContext?.UnbindFromDataSource(this, _dataSource);
            }

            _dataSource = value;
        }
    }

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
                if (string.IsNullOrEmpty(DataSource) || _dynamicContext == null) return;
                if (await _dynamicContext.GetDataSource(DataSource) is not AppBoxCore.DynamicTable entityList) return;

                axes = new Axis[_xAxes.Length];
                for (var i = 0; i < axes.Length; i++)
                {
                    axes[i] = _xAxes[i].Build(_dynamicContext, entityList);
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
                if (string.IsNullOrEmpty(DataSource) || _dynamicContext == null) return;
                if (await _dynamicContext.GetDataSource(DataSource) is not AppBoxCore.DynamicTable entityList) return;

                axes = new Axis[_yAxes.Length];
                for (var i = 0; i < axes.Length; i++)
                {
                    axes[i] = _yAxes[i].Build(_dynamicContext, entityList);
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
            if (string.IsNullOrEmpty(DataSource) || _dynamicContext == null) return;
            if (await _dynamicContext.GetDataSource(DataSource) is not AppBoxCore.DynamicTable entityList) return;

            var runtimeSeries = new ISeries[_series.Length];
            for (var i = 0; i < _series.Length; i++)
            {
                runtimeSeries[i] = _series[i].Build(_dynamicContext, entityList);
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

        //监听目标数据集变更
        _dynamicContext = FindParent(w => w is IDynamicContext) as IDynamicContext;
        _dynamicContext?.BindToDataSource(this, _dataSource);

        OnSeriesChanged();
        if (_xAxes != null) OnAxesChanged(true);
        if (_yAxes != null) OnAxesChanged(false);
    }

    protected override void OnUnmounted()
    {
        //取消监听数据集变更
        _dynamicContext?.UnbindFromDataSource(this, _dataSource);
        base.OnUnmounted();
    }

    #region ====IDataSourceBinder====

    void IDataSourceBinder.OnDataChanged() => OnSeriesChanged();

    #endregion

    private static IEnumerable<ISeries> MakeMockSeries() =>
        new ISeries[] { new ColumnSeries<float>() { Values = new float[] { 1, 2, 3, 4, 5, 6 } } };
}