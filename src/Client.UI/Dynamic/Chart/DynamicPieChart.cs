using System.Text.Json.Serialization;
using PixUI.LiveCharts;
using PixUI.LiveCharts.Painting;
using LiveChartsCore;
using LiveChartsCore.Measure;
using PixUI;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic;

public sealed class DynamicPieChart : SingleChildWidget, IDataSourceBinder
{
    public DynamicPieChart()
    {
        _chart = new PieChart();
        Child = _chart;
    }

    private readonly PieChart _chart;
    private PieSeriesSettings? _series;
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
                _dynamicContext?.UnbindFromDataSource(this, _dataSource);
            }

            _dataSource = value;
        }
    }

    public PieSeriesSettings? Series
    {
        get => _series;
        set
        {
            _series = value;
            OnSeriesChanged();
        }
    }

    public LegendPosition LegendPosition
    {
        get => _chart.LegendPosition;
        set => _chart.LegendPosition = value;
    }

    public Color? LegendColor
    {
        get
        {
            if (_chart.LegendTextPaint is SolidColorPaint solidColorPaint)
                return solidColorPaint.Color;
            return null;
        }
        set => _chart.LegendTextPaint = value.HasValue
            ? new SolidColorPaint(value.Value)
            : new SolidColorPaint(new Color(30, 30, 30, 255));
    }

    private async void OnSeriesChanged()
    {
        if (!IsMounted) return;

        if (_series != null)
        {
            if (string.IsNullOrEmpty(DataSource) || _dynamicContext == null) return;
            if (await _dynamicContext.GetDataSource(DataSource) is not AppBoxCore.DataTable entityList) return;

            try
            {
                var runtimeSeries = _series.Build(_dynamicContext, entityList);
                _chart.Series = runtimeSeries;
            }
            catch (Exception e)
            {
                Notification.Error($"获取数据集错误: {e.Message}");
            }
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
    }

    protected override void OnUnmounted()
    {
        //取消监听数据集变更
        _dynamicContext?.UnbindFromDataSource(this, _dataSource);
        base.OnUnmounted();
    }

    #region ====IDataSourceBinder====

    public event Action<IDataSourceBinder, object?>? CurrentRowChanged;

    void IDataSourceBinder.OnDataChanged(bool isReset)
    {
        if (!isReset)
            OnSeriesChanged();
        // else
        // {
        //     //TODO:
        // }
    }

    #endregion

    private static IEnumerable<ISeries> MakeMockSeries() => new PieSeries<float>[]
    {
        new() { Values = [1f] },
        new() { Values = [2f] },
        new() { Values = [3f] },
        new() { Values = [4f] },
        new() { Values = [5f] },
        new() { Values = [6f] },
    };
}