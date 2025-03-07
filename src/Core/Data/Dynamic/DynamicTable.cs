namespace AppBoxCore;

/// <summary>
/// 动态数据表
/// </summary>
public sealed class DynamicTable : List<DynamicRow>, IBinSerializable
{
    internal DynamicTable() { }

    public DynamicTable(DynamicFieldInfo[] fields)
    {
        Fields = fields;
    }

    public static DynamicTable From<T>(IList<T> entityList) where T : Entity
    {
        throw new NotImplementedException();
    }

    public DynamicFieldInfo[] Fields { get; private set; } = null!;

    public void WriteTo(IOutputStream ws)
    {
        //Fields
        ws.WriteVariant(Fields.Length);
        for (var i = 0; i < Fields.Length; i++)
        {
            ws.WriteString(Fields[i].Name);
            ws.WriteByte((byte)Fields[i].Type);
        }

        //Rows
        ws.WriteVariant(Count);
        for (var i = 0; i < Count; i++)
        {
            this[i].WriteTo(ws, Fields);
        }
    }

    public void ReadFrom(IInputStream rs)
    {
        //Fields
        var count = rs.ReadVariant();
        Fields = new DynamicFieldInfo[count];
        for (var i = 0; i < count; i++)
        {
            Fields[i] = new DynamicFieldInfo(rs.ReadString()!, (DynamicFieldFlag)rs.ReadByte());
        }

        //Rows
        count = rs.ReadVariant();
        for (var i = 0; i < count; i++)
        {
            var item = new DynamicRow();
            item.ReadFrom(rs, Fields);
            Add(item);
        }
    }
}