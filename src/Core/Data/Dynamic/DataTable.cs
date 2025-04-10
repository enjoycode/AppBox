using System.Collections.ObjectModel;

namespace AppBoxCore;

/// <summary>
/// 动态数据表
/// </summary>
public sealed class DataTable : Collection<DataRow>, IBinSerializable
{
    internal DataTable() { }

    public DataTable(DataColumn[] columns)
    {
        Columns = columns;
    }

    private List<DataRow>? _removedRows;

    public IList<DataRow>? RemovedRows => _removedRows;

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
        _removedRows = null;

        foreach (var row in this)
        {
            row.AcceptChanges();
        }
    }

    #region ====Overrides====

    protected override void RemoveItem(int index)
    {
        TryAddToRemoved(this[index]);
        base.RemoveItem(index);
    }

    protected override void SetItem(int index, DataRow item)
    {
        TryAddToRemoved(this[index]);

        base.SetItem(index, item);
    }

    protected override void ClearItems()
    {
        foreach (var row in this)
        {
            TryAddToRemoved(row);
        }

        base.ClearItems();
    }

    private void TryAddToRemoved(DataRow row)
    {
        if (row.PersistentState != PersistentState.Detached)
        {
            _removedRows ??= new List<DataRow>();
            _removedRows.Add(row);
        }
    }

    #endregion

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