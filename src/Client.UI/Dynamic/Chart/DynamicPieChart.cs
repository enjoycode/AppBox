using System;
using System.Collections.Generic;
using LiveCharts;
using LiveCharts.Painting;
using LiveChartsCore;
using LiveChartsCore.Measure;
using PixUI;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic;

public sealed class DynamicPieChart : SingleChildWidget
{
    public DynamicPieChart()
    {
        _chart = new PieChart();
        Child = _chart;
    }

    private readonly PieChart _chart;
    private PieSeriesSettings? _series;

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
            ? new SolidColorPaint() { Color = value.Value }
            : SolidColorPaint.MakeByColor(new Color(30, 30, 30, 255));
    }

    private async void OnSeriesChanged()
    {
        if (!IsMounted) return;

        if (_series != null)
        {
            var dynamicView = FindParent(w => w is IDynamicView) as IDynamicView;
            if (dynamicView == null) return;

            try
            {
                var runtimeSeries = await _series.Build(dynamicView);
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

        OnSeriesChanged();
    }

    private static IEnumerable<ISeries> MakeMockSeries() => new PieSeries<float>[]
    {
        new() { Values = new[] { 1f } },
        new() { Values = new[] { 2f } },
        new() { Values = new[] { 3f } },
        new() { Values = new[] { 4f } },
        new() { Values = new[] { 5f } },
        new() { Values = new[] { 6f } },
    };
}