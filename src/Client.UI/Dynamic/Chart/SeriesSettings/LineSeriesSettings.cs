using System.Threading.Tasks;
using AppBoxCore;
using LiveCharts;
using LiveChartsCore;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic;

public sealed class LineSeriesSettings : CartesianSeriesSettings
{
    public override string Type => "Line";

    public double LineSmoothness { get; set; } = 0.65f;

    public override CartesianSeriesSettings Clone()
    {
        return new LineSeriesSettings() { DataSet = DataSet, Field = Field, Name = Name };
    }

    public override async Task<ISeries> Build(IDynamicView dynamicView)
    {
        return new LineSeries<DynamicEntity>
        {
            Name = Name ?? Field,
            Values = (DynamicDataSet?)(await dynamicView.GetDataSet(DataSet)),
            LineSmoothness = LineSmoothness,
            Mapping = (obj, point) =>
            {
                var v = obj[Field].ToDouble();
                if (v.HasValue)
                {
                    point.PrimaryValue = v.Value;
                    point.SecondaryValue = point.Context.Entity.EntityIndex;
                }
            }
        };
    }
}