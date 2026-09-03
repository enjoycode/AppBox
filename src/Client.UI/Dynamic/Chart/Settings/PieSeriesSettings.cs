using AppBoxDesign;
using PixUI.LiveCharts;
using LiveChartsCore;
using PixUI.Dynamic;
using Log = PixUI.Log;

namespace AppBoxClient.Dynamic;

public sealed class PieSeriesSettings : PieSeriesBase, IDynamicChartSeries
{
    /// <summary>
    /// 对应数据集的值字段 eg: 月销售额
    /// </summary>
    public string Field
    {
        get => Values;
        set => Values = value;
    }

    public IDynamicChartSeries Clone() => new PieSeriesSettings() { Field = Field, Name = Name };

    public IEnumerable<ISeries> Build(IDynamicContext dynamicContext, AppBoxCore.DataTable list)
    {
        try
        {
            var runtimeSeries = list.Select(e =>
            {
                var s = new PieSeries<double?>()
                {
                    Values = [e[Field].ToDouble()]
                };
                if (!string.IsNullOrEmpty(Name))
                    s.Name = e[Name!].ToStringValue();
                s.InnerRadius = InnerRadius;
                s.MaxRadialColumnWidth = MaxRadialColumnWidth;
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
            return [];
        }
    }
}