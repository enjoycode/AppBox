namespace AppBoxCore;

public abstract class EntityMemberModel
{
    public EntityMemberModel(EntityModel owner, string name, bool allowNull)
    {
        Owner = owner;
        _name = name;
        _allowNull = allowNull;
        _persistentState = PersistentState.Detached;
    }

    public readonly EntityModel Owner; //不用序列化
    public abstract EntityMemberType Type { get; }

    private string _name;
    private string? _originalName;
    private short _memberId;
    protected bool _allowNull; //设计时改变时如果是EntityField需要调用其onFieldTypeChanged
    private PersistentState _persistentState;
    private string? _comment;

    public short MemberId => _memberId;
    public string Name => _name;
    internal string OriginalName => string.IsNullOrEmpty(_originalName) ? Name : _originalName;
    public bool IsNameChanged => _originalName != null && _originalName != _name;
    public PersistentState PersistentState => _persistentState;
    public bool AllowNull => _allowNull;
    public string? Comment => _comment;

    #region ====Design Methods====

    public void InitMemberId(short id)
    {
        if (_memberId == 0)
            _memberId = id;
        else
            throw new InvalidOperationException("Member id has set");
    }

    public abstract void SetAllowNull(bool value);

    public void RenameTo(string newName)
    {
        if (_originalName == null && _persistentState != PersistentState.Detached)
            _originalName = _name;
        _name = newName;
        OnPropertyChanged();
    }

    protected void OnPropertyChanged()
    {
        if (_persistentState != PersistentState.Unchanged) return;

        _persistentState = PersistentState.Modified;
        Owner.OnPropertyChanged();
    }

    public void AcceptChanges()
    {
        _persistentState = _persistentState == PersistentState.Deleted
            ? PersistentState.Detached
            : PersistentState.Unchanged;
        _originalName = null;
    }

    public void AsDeleted()
    {
        _persistentState = PersistentState.Deleted;
        Owner.OnPropertyChanged();
    }

    #endregion

    #region ====Serialization====

    public virtual void WriteTo(IOutputStream ws)
    {
        ws.WriteShort(_memberId);
        ws.WriteString(_name);
        ws.WriteBool(_allowNull);
        ws.WriteString(_comment);

        if (Owner.IsDesignMode)
        {
            ws.WriteString(_originalName);
            ws.WriteByte((byte)_persistentState);
        }
    }

    public virtual void ReadFrom(IInputStream rs)
    {
        _memberId = rs.ReadShort();
        _name = rs.ReadString()!;
        _allowNull = rs.ReadBool();
        _comment = rs.ReadString();

        if (Owner.IsDesignMode)
        {
            _originalName = rs.ReadString();
            _persistentState = (PersistentState)rs.ReadByte();
        }
    }

    #endregion
}