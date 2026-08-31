using AppBoxCore;

namespace AppBoxDesign;

public abstract class LineSeriesBase : CartesianSeriesBase
{
    public sealed override ChartSeriesType SeriesType => ChartSeriesType.Line;

    public double LineSmoothness { get; set; } = 0.65;

    public ChartPaint? Fill { get; set; }

    public override void WriteTo<TWriter>(ref TWriter writer)
    {
        base.WriteTo(ref writer);

        // ReSharper disable once CompareOfFloatsByEqualityOperator
        if (LineSmoothness != 0.65f)
        {
            writer.WriteFieldId(1);
            writer.WriteDouble(LineSmoothness);
        }

        if (Fill != null)
        {
            writer.WriteFieldId(2);
            ChartPaint.SerializeTo(ref writer, Fill);
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
                case 1: LineSmoothness = reader.ReadDouble(); break;
                case 2: Fill = ChartPaint.DeserializeFrom(ref reader); break;
                case 0: return;
                default: throw SerializationException.ReadUnknownField(nameof(ChartSeriesBase), fieldId);
            }
        }
    }
}