using AppBoxCore;

namespace AppBoxClient.Dynamic;

internal sealed class ChartAxisArraySerializer : IDynamicTypeSerializer
{
    public void Serialize<TWriter>(ref TWriter writer, object value) where TWriter : struct, IOutputStream
    {
        var obj = (ChartAxisSettings[])value;
        writer.WriteVariant(obj.Length);
        foreach (var item in obj)
        {
            item.WriteTo(ref writer);
        }
    }

    public object Deserialize<TReader>(ref TReader reader) where TReader : struct, IInputStream
    {
        var count = reader.ReadVariant();
        var obj = new ChartAxisSettings[count];
        for (var i = 0; i < count; i++)
        {
            obj[i] = new ChartAxisSettings();
            obj[i].ReadFrom(ref reader);
        }

        return obj;
    }
}