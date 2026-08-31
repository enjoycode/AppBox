using AppBoxCore;

namespace AppBoxDesign;

public abstract class PieSeriesBase : ChartSeriesBase
{
    public sealed override ChartSeriesType SeriesType => ChartSeriesType.Pie;

    public double InnerRadius { get; set; }

    public double MaxRadialColumnWidth { get; set; } = double.MaxValue;

    public override void WriteTo<TWriter>(ref TWriter writer)
    {
        base.WriteTo(ref writer);

        if (InnerRadius != 0)
        {
            writer.WriteFieldId(1);
            writer.WriteDouble(InnerRadius);
        }

        // ReSharper disable once CompareOfFloatsByEqualityOperator
        if (MaxRadialColumnWidth != double.MaxValue)
        {
            writer.WriteFieldId(2);
            writer.WriteDouble(MaxRadialColumnWidth);
        }

        writer.WriteFieldEnd();
    }

    public override void ReadFrom<TReader>(ref TReader reader)
    {
        base.ReadFrom(ref reader);

        while (true)
        {
            var fieldId = reader.ReadFieldId();
            switch (fieldId)
            {
                case 1: InnerRadius = reader.ReadDouble(); break;
                case 2: MaxRadialColumnWidth = reader.ReadDouble(); break;
                case 0: return;
                default: throw SerializationException.ReadUnknownField(nameof(PieSeriesBase), fieldId);
            }
        }
    }
}