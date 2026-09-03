using AppBoxCore;
using PixUI;

namespace AppBoxClient.Dynamic;

internal sealed class ColorSerializer : IDynamicTypeSerializer
{
    public void Serialize<TWriter>(ref TWriter writer, object value) where TWriter : struct, IOutputStream
    {
        writer.WriteUInt((uint)((Color)value));
    }

    public object Deserialize<TReader>(ref TReader reader) where TReader : struct, IInputStream
    {
        return new Color(reader.ReadUInt());
    }
}