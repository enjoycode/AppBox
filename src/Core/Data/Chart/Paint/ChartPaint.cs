using AppBoxCore;

namespace AppBoxDesign;

public abstract class ChartPaint
{
    public abstract ChartPaintType PaintType { get; }

    internal abstract void WriteTo<TWriter>(ref TWriter writer) where TWriter : struct, IOutputStream;

    internal abstract void ReadFrom<TReader>(ref TReader reader) where TReader : struct, IInputStream;

    internal static void SerializeTo<TWriter>(ref TWriter writer, ChartPaint paint)
        where TWriter : struct, IOutputStream
    {
        writer.WriteByte((byte)paint.PaintType);
        paint.WriteTo(ref writer);
    }

    internal static ChartPaint DeserializeFrom<TReader>(ref TReader reader) where TReader : struct, IInputStream
    {
        var type = (ChartPaintType)reader.ReadByte();
        ChartPaint paint = type switch
        {
            ChartPaintType.SolidColor => new SolidColorPaint(),
            _ => throw new NotImplementedException()
        };
        paint.ReadFrom(ref reader);
        return paint;
    }
}

public enum ChartPaintType : byte
{
    //Don't change value for persistent
    SolidColor = 0,
    LinearGradient = 1,
    RadialGradient = 2,
}