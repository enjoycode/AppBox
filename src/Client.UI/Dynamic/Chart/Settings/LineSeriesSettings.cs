using AppBoxCore;
using LiveCharts;
using LiveChartsCore;
using LiveChartsCore.Kernel;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic;

public sealed class LineSeriesSettings : CartesianSeriesSettings
{
    public override string Type => "Line";

    public double? Smoothness { get; set; }

    public bool Fill { get; set; } = true;

    public override CartesianSeriesSettings Clone()
    {
        return new LineSeriesSettings()
        {
            Field = Field, Name = Name, Smoothness = Smoothness, Fill = Fill
        };
    }

    public override ISeries Build(IDynamicContext dynamicContext, AppBoxCore.DataTable list)
    {
        var res = new LineSeries<DataRow>
        {
            Name = Name ?? Field,
            Values = list,
            LineSmoothness = Smoothness ?? 0.65f,
            Mapping = (obj, point) =>
            {
                var v = obj[Field].ToDouble();
                if (v.HasValue)
                {
                    point.Coordinate = new Coordinate(point.Index, v.Value);
                }
            }
        };

        if (Smoothness.HasValue) res.LineSmoothness = Smoothness.Value;
        if (!Fill) res.Fill = null;

        return res;
    }
}