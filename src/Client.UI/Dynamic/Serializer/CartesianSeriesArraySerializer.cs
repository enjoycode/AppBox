using AppBoxCore;

namespace AppBoxClient.Dynamic;

internal sealed class CartesianSeriesArraySerializer : IDynamicTypeSerializer
{
    public void Serialize<TWriter>(ref TWriter writer, object value) where TWriter : struct, IOutputStream
    {
        var obj = (IDynamicCartesianSeries[])value;
        writer.WriteVariant(obj.Length);
        foreach (var item in obj)
        {
            writer.WriteByte(GetTypeFlag(item));
            item.WriteTo(ref writer);
        }
    }

    public object Deserialize<TReader>(ref TReader reader) where TReader : struct, IInputStream
    {
        var count = reader.ReadVariant();
        var obj = new IDynamicCartesianSeries[count];
        for (var i = 0; i < count; i++)
        {
            var type = reader.ReadByte();
            obj[i] = CreateSeries(type);
            obj[i].ReadFrom(ref reader);
        }

        return obj;
    }

    private static byte GetTypeFlag(IDynamicCartesianSeries series) => series switch
    {
        LineSeriesSettings => 0,
        ColumnSeriesSettings => 1,
        _ => throw new NotImplementedException()
    };

    private static IDynamicCartesianSeries CreateSeries(byte type) => type switch
    {
        0 => new LineSeriesSettings(),
        1 => new ColumnSeriesSettings(),
        _ => throw new NotImplementedException()
    };
}