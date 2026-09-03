using AppBoxCore;
using AppBoxDesign;
using PixUI.LiveCharts;
using LiveChartsCore;
using LiveChartsCore.Kernel;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic;

public sealed class LineSeriesSettings : LineSeriesBase, IDynamicCartesianSeries
{
    /// <summary>
    /// 对应数据集的字段名
    /// </summary>
    public string Field
    {
        get => Values;
        set => Values = value;
    }

    public bool Fill { get; set; } = true;

    public IDynamicCartesianSeries Clone()
    {
        return new LineSeriesSettings()
        {
            Field = Field, Name = Name, LineSmoothness = LineSmoothness, Fill = Fill
        };
    }

    public IEnumerable<ISeries> Build(IDynamicContext dynamicContext, DataTable list)
    {
        var res = new LineSeries<DataRow>
        {
            Name = Name ?? Field,
            Values = list,
            LineSmoothness = LineSmoothness,
            Mapping = (obj, index) =>
            {
                var v = obj[Field].ToDouble();
                return v == null ? Coordinate.Empty : new Coordinate(index, v.Value);
            }
        };

        if (!Fill) res.Fill = null;

        return [res];
    }
}