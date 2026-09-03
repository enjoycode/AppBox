using AppBoxCore;
using PixUI;

namespace AppBoxClient.Dynamic;

internal sealed class InputBorderSerializer : IDynamicTypeSerializer
{
    public void Serialize<TWriter>(ref TWriter writer, object value) where TWriter : struct, IOutputStream
    {
        if (value is OutlineInputBorder outline)
        {
            writer.WriteByte(0); //type
            writer.WriteUInt((uint)outline.BorderSide.Color);
            writer.WriteFloat(outline.BorderSide.Width);
            writer.WriteFloat(outline.BorderRadius.TopLeft.X); //暂全部视为一样的
            writer.WriteFieldEnd();
        }
        else if (value is UnderlineInputBorder underline)
        {
            writer.WriteByte(1); //type
            writer.WriteUInt((uint)underline.BorderSide.Color);
            writer.WriteFloat(underline.BorderSide.Width);
            writer.WriteFieldEnd();
        }
        else
        {
            throw new NotImplementedException(value.GetType().FullName);
        }
    }


    public object Deserialize<TReader>(ref TReader reader) where TReader : struct, IInputStream
    {
        var type = reader.ReadByte();
        switch (type)
        {
            case 0: return DeserializeOutline(ref reader);
            case 1: return DeserializeUnderline(ref reader);
            default: throw new NotImplementedException();
        }
    }

    private static OutlineInputBorder DeserializeOutline<TReader>(ref TReader reader)
        where TReader : struct, IInputStream
    {
        var borderSide = new BorderSide(new(reader.ReadUInt()), reader.ReadFloat());
        var borderRadius = BorderRadius.All(Radius.Circular(reader.ReadFloat()));
        reader.ReadFieldId();
        return new OutlineInputBorder(borderSide, borderRadius);
    }

    private static UnderlineInputBorder DeserializeUnderline<TReader>(ref TReader reader)
        where TReader : struct, IInputStream
    {
        var borderSide = new BorderSide(new(reader.ReadUInt()), reader.ReadFloat());
        reader.ReadFieldId();
        return new UnderlineInputBorder(borderSide);
    }
}