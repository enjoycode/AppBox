using System;
using System.Linq;
using AppBoxCore;
using LiveCharts;
using LiveChartsCore;
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

    private async void OnSeriesChanged()
    {
        if (!IsMounted) return;

        if (_series != null)
        {
            var dynamicView = FindParent(w => w is IDynamicView) as IDynamicView;
            if (dynamicView == null)
                throw new NotImplementedException();

            var values = (DynamicDataSet?)await dynamicView.GetDataSet(_series.DataSet);
            if (values != null)
            {
                var runtimeSeries = values.Select(e =>
                {
                    var s = new PieSeries<double?>() { Values = new[] { e[_series.Field].ToDouble() } };
                    if (!string.IsNullOrEmpty(s.Name))
                        s.Name = e[_series.Name!].ToString();
                    return s;
                });

                _chart.Series = runtimeSeries;
            }
        }
    }

    protected override void OnMounted()
    {
        base.OnMounted();

        if (_series != null /*&& _chart.Series == null*/)
            OnSeriesChanged();
        //TODO: else 填充mock series
    }
}