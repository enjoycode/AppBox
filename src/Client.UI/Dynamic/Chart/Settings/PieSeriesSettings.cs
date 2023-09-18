using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AppBoxCore;
using LiveCharts;
using LiveChartsCore;
using PixUI.Dynamic;
using Log = PixUI.Log;

namespace AppBoxClient.Dynamic;

public sealed class PieSeriesSettings
{
    /// <summary>
    /// 对应的数据集名称
    /// </summary>
    public string DataSet { get; set; } = null!;

    /// <summary>
    /// 对应数据集的值字段 eg: 月销售额
    /// </summary>
    public string Field { get; set; } = null!;

    /// <summary>
    /// 对应数据集的名称字段 eg: 月份
    /// </summary>
    public string? Name { get; set; } = null!;

    public double? InnerRadius { get; set; }

    public PieSeriesSettings Clone() => new() { DataSet = DataSet, Field = Field, Name = Name };

    public async Task<IEnumerable<ISeries>> Build(IDynamicView dynamicView)
    {
        var ds = (DynamicDataSet?)await dynamicView.GetDataSet(DataSet);
        if (ds == null) return Array.Empty<ISeries>();

        try
        {
            var runtimeSeries = ds.Select(e =>
            {
                var s = new PieSeries<double?>()
                {
                    Values = new[] { e[Field].ToDouble() }
                };
                if (!string.IsNullOrEmpty(s.Name))
                    s.Name = e[Name!].ToString();
                if (InnerRadius.HasValue)
                    s.InnerRadius = InnerRadius.Value;
                return s;
            });

            return runtimeSeries;
        }
        catch (Exception e)
        {
            Log.Error(e.Message);
            return Array.Empty<ISeries>();
        }
    }
}