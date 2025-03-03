using AppBoxCore;
using LiveCharts;
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

    public override ISeries Build(IDynamicContext dynamicContext, DynamicEntityList list)
    {
        var res = new ColumnSeries<DynamicEntity>()
        {
            Name = Name ?? Field,
            Values = list,
            Mapping = (obj, point) =>
            {
                var v = obj[Field].ToDouble();
                if (v.HasValue)
                {
                    point.Coordinate = new Coordinate(point.Index, v.Value);
                }
            }
        };
        return res;
    }
}