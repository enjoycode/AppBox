namespace AppBoxCore;

/// <summary>
/// 动态数据表
/// </summary>
public sealed class DataTable : List<DataRow>, IBinSerializable
{
    internal DataTable() { }

    public DataTable(DataColumn[] columns)
    {
        Columns = columns;
    }

    public DataColumn[] Columns { get; private set; } = null!;

    /// <summary>
    /// 映射的实体模型标识号，没有映射等于0
    /// </summary>
    public ModelId EntityModelId { get; internal set; } = 0;

    public static DataTable From<T>(IList<T> entityList) where T : Entity
    {
        throw new NotImplementedException();
    }

    public void AcceptChanges()
    {
        foreach (var row in this)
        {
            row.AcceptChanges();
        }
    }

    #region ====Serialization====

    public void WriteTo(IOutputStream ws)
    {
        ws.WriteLong(EntityModelId);

        //Columns
        ws.WriteVariant(Columns.Length);
        for (var i = 0; i < Columns.Length; i++)
        {
            ws.WriteString(Columns[i].Name);
            ws.WriteByte((byte)Columns[i].Type);
        }

        //Rows
        ws.WriteVariant(Count);
        for (var i = 0; i < Count; i++)
        {
            this[i].WriteTo(ws, Columns);
        }
    }

    public void ReadFrom(IInputStream rs)
    {
        EntityModelId = rs.ReadLong();

        //Columns
        var count = rs.ReadVariant();
        Columns = new DataColumn[count];
        for (var i = 0; i < count; i++)
        {
            Columns[i] = new DataColumn(rs.ReadString()!, (DataType)rs.ReadByte());
        }

        //Rows
        count = rs.ReadVariant();
        for (var i = 0; i < count; i++)
        {
            var item = new DataRow();
            item.ReadFrom(rs, Columns);
            Add(item);
        }
    }

    #endregion
}