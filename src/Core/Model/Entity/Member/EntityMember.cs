namespace AppBoxCore;

public abstract class EntityMember
{
    protected EntityMember(EntityModel owner, string name, bool allowNull)
    {
        Owner = owner;
        Name = name;
        _allowNull = allowNull;
        PersistentState = PersistentState.Detached;
    }

    public readonly EntityModel Owner; //不用序列化
    public abstract EntityMemberType Type { get; }

    private string? _originalName;
    protected bool _allowNull; //设计时改变时如果是EntityField需要调用其onFieldTypeChanged

    public short MemberId { get; private set; }
    public string Name { get; private set; }
    internal string OriginalName => string.IsNullOrEmpty(_originalName) ? Name : _originalName;
    public bool IsNameChanged => _originalName != null && _originalName != Name;
    public PersistentState PersistentState { get; private set; }

    public virtual bool AllowNull => _allowNull;

    public string? Comment { get; set; }

    public bool IsForeignKeyMember => Type == EntityMemberType.EntityField
                                      && ((EntityFieldMember)this).IsForeignKey;

    #region ====Design Methods====

    internal void InitMemberId(short id)
    {
        if (MemberId == 0)
            MemberId = id;
        else
            throw new InvalidOperationException("Member id has set");
    }

    internal abstract void SetAllowNull(bool value);

    internal void RenameTo(string newName)
    {
        if (_originalName == null && PersistentState != PersistentState.Detached)
            _originalName = Name;
        Name = newName;
        OnPropertyChanged();
    }

    protected void OnPropertyChanged()
    {
        if (PersistentState != PersistentState.Unchanged) return;

        PersistentState = PersistentState.Modified;
        Owner.OnPropertyChanged();
    }

    internal void AcceptChanges()
    {
        PersistentState = PersistentState == PersistentState.Deleted
            ? PersistentState.Detached
            : PersistentState.Unchanged;
        _originalName = null;
    }

    internal void AsDeleted()
    {
        PersistentState = PersistentState.Deleted;
        Owner.OnPropertyChanged();
    }

    /// <summary>
    /// 添加对其他模型或成员的引用
    /// </summary>
    internal virtual void AddModelReferences(List<ModelReferenceInfo> list,
        ModelReferenceType referenceType, ModelId modelID, string? memberName,
        short? entityMemberId) { }

    #endregion

    #region ====Serialization====

    public virtual void WriteTo(IOutputStream ws)
    {
        ws.WriteShort(MemberId);
        ws.WriteString(Name);
        ws.WriteBool(_allowNull);
        ws.WriteString(Comment);

        if (Owner.IsDesignMode)
        {
            ws.WriteString(_originalName);
            ws.WriteByte((byte)PersistentState);
        }
    }

    public virtual void ReadFrom(IInputStream rs)
    {
        MemberId = rs.ReadShort();
        Name = rs.ReadString()!;
        _allowNull = rs.ReadBool();
        Comment = rs.ReadString();

        if (Owner.IsDesignMode)
        {
            _originalName = rs.ReadString();
            PersistentState = (PersistentState)rs.ReadByte();
        }
    }

    #endregion
}