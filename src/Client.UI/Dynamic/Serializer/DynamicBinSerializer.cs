using AppBoxCore;

namespace AppBoxClient.Dynamic;

internal sealed class DynamicBinSerializer<TObject> : IDynamicTypeSerializer where TObject : IBinSerializable, new()
{
    public void Serialize<TWriter>(ref TWriter writer, object value) where TWriter : struct, IOutputStream
    {
        var obj = (TObject)value;
        obj.WriteTo(ref writer);
    }

    public object Deserialize<TReader>(ref TReader reader) where TReader : struct, IInputStream
    {
        var obj = new TObject();
        obj.ReadFrom(ref reader);
        return obj;
    }
}