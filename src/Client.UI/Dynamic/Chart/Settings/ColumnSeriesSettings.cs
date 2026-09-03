using AppBoxCore;
using AppBoxDesign;
using PixUI.LiveCharts;
using LiveChartsCore;
using LiveChartsCore.Kernel;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic;

public sealed class ColumnSeriesSettings : ColumnSeriesBase, IDynamicCartesianSeries
{
    /// <summary>
    /// 对应数据集的字段名
    /// </summary>
    public string Field
    {
        get => Values;
        set => Values = value;
    }

    public IDynamicCartesianSeries Clone()
    {
        return new ColumnSeriesSettings()
        {
            Field = Field, Name = Name
        };
    }

    public IEnumerable<ISeries> Build(IDynamicContext dynamicContext, DataTable list)
    {
        var res = new ColumnSeries<DataRow>()
        {
            Name = Name ?? Field,
            Values = list,
            Mapping = (obj, index) =>
            {
                var v = obj[Field].ToDouble();
                return v == null ? Coordinate.Empty : new Coordinate(index, v.Value);
            }
        };
        return [res];
    }
}