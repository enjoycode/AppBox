using AppBoxCore;

namespace AppBoxClient.Dynamic;

internal sealed class TableColumnArraySerializer : IDynamicTypeSerializer
{
    public void Serialize<TWriter>(ref TWriter writer, object value) where TWriter : struct, IOutputStream
    {
        var obj = (TableColumnSettings[])value;
        writer.WriteVariant(obj.Length);
        foreach (var col in obj)
        {
            writer.WriteByte(GetColumnType(col));
            col.WriteTo(ref writer);
        }
    }

    public object Deserialize<TReader>(ref TReader reader) where TReader : struct, IInputStream
    {
        var count = reader.ReadVariant();
        var obj = new TableColumnSettings[count];
        for (var i = 0; i < count; i++)
        {
            var type = reader.ReadByte();
            var col = CreateColumn(type);
            col.ReadFrom(ref reader);
            obj[i] = col;
        }

        return obj;
    }

    private static byte GetColumnType(TableColumnSettings column) => column switch
    {
        TextColumnSettings => 0,
        RowNumColumnSettings => 1,
        GroupColumnSettings => 2,
        _ => throw new NotImplementedException()
    };

    private static TableColumnSettings CreateColumn(byte type) => type switch
    {
        0 => new TextColumnSettings(),
        1 => new RowNumColumnSettings(),
        2 => new GroupColumnSettings(),
        _ => throw new NotImplementedException()
    };
}