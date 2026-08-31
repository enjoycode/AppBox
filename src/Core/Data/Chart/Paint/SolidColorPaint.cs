using AppBoxCore;

namespace AppBoxDesign;

public sealed class SolidColorPaint : ChartPaint
{
    public override ChartPaintType PaintType => ChartPaintType.SolidColor;

    public uint Color { get; set; }

    public float StrokeWidth { get; set; }

    internal override void WriteTo<TWriter>(ref TWriter writer)
    {
        writer.WriteInt(unchecked((int)Color));

        // ReSharper disable once CompareOfFloatsByEqualityOperator
        if (StrokeWidth != 1.0f)
        {
            writer.WriteFieldId(1);
            writer.WriteFloat(StrokeWidth);
        }

        writer.WriteFieldEnd();
    }

    internal override void ReadFrom<TReader>(ref TReader reader)
    {
        Color = unchecked((uint)reader.ReadInt());

        while (true)
        {
            var fieldId = reader.ReadFieldId();
            switch (fieldId)
            {
                case 1: StrokeWidth = reader.ReadFloat(); break;
                case 0: return;
                default: throw SerializationException.ReadUnknownField(nameof(SolidColorPaint), fieldId);
            }
        }
    }
}