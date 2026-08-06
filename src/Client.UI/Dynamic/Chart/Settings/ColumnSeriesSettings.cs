using AppBoxCore;
using PixUI.LiveCharts;
using LiveChartsCore;
using LiveChartsCore.Kernel;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic;

public sealed class ColumnSeriesSettings : CartesianSeriesSettings
{
    public override string Type => "Column";

    public override CartesianSeriesSettings Clone()
    {
        return new ColumnSeriesSettings()
        {
            Field = Field, Name = Name
        };
    }

    public override ISeries Build(IDynamicContext dynamicContext, DataTable list)
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
        return res;
    }
}