using AppBoxCore;

namespace AppBoxClient.Dynamic;

internal sealed class TableFooterCellArraySerializer : IDynamicTypeSerializer
{
    public void Serialize<TWriter>(ref TWriter writer, object value) where TWriter : struct, IOutputStream
    {
        var obj = (TableFooterCell[])value;
        writer.WriteVariant(obj.Length);
        foreach (var cell in obj)
        {
            cell.WriteTo(ref writer);
        }
    }

    public object Deserialize<TReader>(ref TReader reader) where TReader : struct, IInputStream
    {
        var count = reader.ReadVariant();
        var obj = new TableFooterCell[count];
        for (var i = 0; i < count; i++)
        {
            obj[i] = new TableFooterCell();
            obj[i].ReadFrom(ref reader);
        }

        return obj;
    }
}