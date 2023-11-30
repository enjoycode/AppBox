using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AppBoxCore;
using LiveCharts;
using LiveCharts.Painting;
using LiveChartsCore;
using LiveChartsCore.Drawing;
using LiveChartsCore.Measure;
using PixUI;
using PixUI.Dynamic;
using Log = PixUI.Log;

namespace AppBoxClient.Dynamic;

public sealed class PieSeriesSettings
{
    /// <summary>
    /// 对应数据集的值字段 eg: 月销售额
    /// </summary>
    public string Field { get; set; } = null!;

    /// <summary>
    /// 对应数据集的名称字段 eg: 月份
    /// </summary>
    public string? Name { get; set; } = null!;

    public double? InnerRadius { get; set; }

    public PieSeriesSettings Clone() => new() { Field = Field, Name = Name };

    public IEnumerable<ISeries> Build(IDynamicView dynamicView, DynamicDataSet dataset)
    {
        try
        {
            var runtimeSeries = dataset.Select(e =>
            {
                var s = new PieSeries<double?>()
                {
                    Values = new[] { e[Field].ToDouble() }
                };
                if (!string.IsNullOrEmpty(Name))
                    s.Name = e[Name!].ToStringValue();
                if (InnerRadius.HasValue)
                    s.InnerRadius = InnerRadius.Value;
                // s.DataLabelsPaint = new SolidColorPaint { Color = Colors.Black };
                // s.DataLabelsPosition = PolarLabelsPosition.Outer;
                // s.DataLabelsFormatter = point => $"{point.StackedValue?.Share:P0}";
                return s;
            }).ToArray() /*Must ToArray()*/;

            return runtimeSeries;
        }
        catch (Exception e)
        {
            Log.Error(e.Message);
            return Array.Empty<ISeries>();
        }
    }
}