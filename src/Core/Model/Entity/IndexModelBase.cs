namespace AppBoxCore;

/// <summary>
/// 系统存储及Sql存储的索引模型基类
/// </summary>
public abstract class IndexModelBase : IBinSerializable
{
    public EntityModel Owner { get; private set; }
    public byte IndexId { get; private set; }
    public string Name { get; private set; } = null!;
    public bool Unique { get; private set; }
    public OrderedField[] Fields { get; private set; } = null!;

    /// <summary>
    /// 索引覆盖字段
    /// </summary>
    public short[]? StoringFields { get; private set; }

    public bool HasStoringFields => StoringFields != null && StoringFields.Length > 0;

    public PersistentState PersistentState { get; private set; }

    #region ====Ctor====

    protected IndexModelBase(EntityModel owner)
    {
        Owner = owner;
    }

    protected IndexModelBase(EntityModel owner, string name, bool unique,
        OrderedField[] fields, short[]? storingFields = null)
    {
        Owner = owner;
        Name = name;
        Unique = unique;
        Fields = fields;
        StoringFields = storingFields;
    }

    #endregion

    #region ====Design Methods====

    internal void InitIndexId(byte id)
    {
        if (IndexId != 0)
            throw new Exception("IndexId has initialized");
        IndexId = id;
    }

    internal void AcceptChanges()
    {
        PersistentState = PersistentState.Unchanged;
    }

    internal void MarkDeleted()
    {
        PersistentState = PersistentState.Deleted;
        Owner.OnPropertyChanged();
        Owner.ChangeSchemaVersion();
    }

    #endregion

    #region ====Serialization====

    public virtual void WriteTo(IOutputStream ws)
    {
        ws.WriteByte(IndexId);
        ws.WriteString(Name);
        ws.WriteBool(Unique);

        //Fields
        ws.WriteVariant(Fields.Length);
        for (var i = 0; i < Fields.Length; i++)
        {
            Fields[i].WriteTo(ws);
        }

        //Storing fields
        ws.WriteVariant(StoringFields?.Length ?? 0);
        if (StoringFields != null)
        {
            for (var i = 0; i < StoringFields.Length; i++)
            {
                ws.WriteShort(StoringFields[i]);
            }
        }

        if (Owner.IsDesignMode)
            ws.WriteByte((byte)PersistentState);
    }

    public virtual void ReadFrom(IInputStream rs)
    {
        IndexId = rs.ReadByte();
        Name = rs.ReadString()!;
        Unique = rs.ReadBool();

        //Fields
        var count = rs.ReadVariant();
        Fields = new OrderedField[count];
        for (var i = 0; i < count; i++)
        {
            Fields[i].ReadFrom(rs);
        }

        //Storing fields
        count = rs.ReadVariant();
        if (count > 0)
        {
            StoringFields = new short[count];
            for (var i = 0; i < count; i++)
            {
                StoringFields[i] = rs.ReadShort();
            }
        }

        if (Owner.IsDesignMode)
            PersistentState = (PersistentState)rs.ReadByte();
    }

    #endregion

    #region ====导入方法====

    // internal void Import(EntityModel owner)
    // {
    //     Owner = owner;
    //     PersistentState = PersistentState.Detached;
    // }
    //
    // internal void UpdateFrom(IndexModelBase from)
    // {
    //     //TODO: fix this
    //     PersistentState = PersistentState.Modified;
    //     Log.Warn("导入索引暂未实现");
    // }

    #endregion
}