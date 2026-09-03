using AppBoxCore;
using PixUI;

namespace AppBoxClient.Dynamic;

internal sealed class EdgeInsetsSerializer : IDynamicTypeSerializer
{
    public void Serialize<TWriter>(ref TWriter writer, object value) where TWriter : struct, IOutputStream
    {
        var obj = (EdgeInsets)value;
        writer.WriteBool(obj.IsAllSame);
        if (obj.IsAllSame)
        {
            writer.WriteFloat(obj.Left);
        }
        else
        {
            writer.WriteFloat(obj.Left);
            writer.WriteFloat(obj.Top);
            writer.WriteFloat(obj.Right);
            writer.WriteFloat(obj.Bottom);
        }
    }

    public object Deserialize<TReader>(ref TReader reader) where TReader : struct, IInputStream
    {
        var allSame = reader.ReadBool();
        return allSame
            ? EdgeInsets.All(reader.ReadFloat())
            : EdgeInsets.Only(reader.ReadFloat(), reader.ReadFloat(), reader.ReadFloat(), reader.ReadFloat());
    }
}