using AppBoxCore;

namespace AppBoxDesign;

public abstract class ColumnSeriesBase : CartesianSeriesBase
{
    public sealed override ChartSeriesType SeriesType => ChartSeriesType.Column;

    public override void WriteTo<TWriter>(ref TWriter writer)
    {
        base.WriteTo(ref writer);
        writer.WriteFieldEnd();
    }

    public override void ReadFrom<TReader>(ref TReader reader)
    {
        base.ReadFrom(ref reader);
        reader.ReadFieldId();
    }
}