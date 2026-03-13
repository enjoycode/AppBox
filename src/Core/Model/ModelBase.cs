namespace AppBoxCore;

/// <summary>
/// 模型基类，实例分为设计时与运行时
/// </summary>
public abstract class ModelBase : IBinSerializable
{
    protected ModelBase() { }

    protected ModelBase(ModelId id, string name)
    {
        IsDesignMode = true;
        _id = id;
        Name = name;
        PersistentState = PersistentState.Detached;
    }

    private ModelId _id;
    private string? _originalName;
    private Guid? _folderId;

    public ModelLayer ModelLayer => _id.Layer;
    public ModelType ModelType => _id.Type;

    public ModelId Id => _id;
    public int AppId => Id.AppId;
    public string Name { get; private set; } = null!;

    public string OriginalName => _originalName ?? Name;
    public int Version { get; private set; }

    public Guid? FolderId
    {
        get => _folderId;
        set => _folderId = value;
    }

    public bool IsDesignMode { get; private set; }

    public PersistentState PersistentState { get; private set; }

    #region ====Design Methods====

    public bool IsNameChanged => _originalName != null && _originalName != Name;

    internal void RenameTo(string newName)
    {
        CheckDesignMode();

        //如果已经重命名过，不再修改_originalName
        if (_originalName == null && PersistentState != PersistentState.Detached)
            _originalName = Name;
        Name = newName;
        OnPropertyChanged();
    }

    internal void IncreaseVersion() => Version++;

    internal virtual void AcceptChanges()
    {
        if (PersistentState == PersistentState.Unchanged) return;
        PersistentState = PersistentState == PersistentState.Deleted
            ? PersistentState.Detached
            : PersistentState.Unchanged;
        _originalName = null;
    }

    /// <summary>
    /// 标记为删除状态
    /// </summary>
    internal void Delete()
    {
        if (PersistentState != PersistentState.Detached)
            PersistentState = PersistentState.Deleted;
    }

    internal void CheckDesignMode()
    {
        if (!IsDesignMode) throw new InvalidOperationException();
    }

    protected internal void OnPropertyChanged()
    {
        if (PersistentState == PersistentState.Unchanged)
            PersistentState = PersistentState.Modified;
    }

    #endregion

    #region ====Serialization====

    public virtual void WriteTo(IOutputStream ws)
    {
        ws.WriteLong(_id);
        ws.WriteString(Name);
        ws.WriteBool(IsDesignMode);

        if (IsDesignMode)
        {
            ws.WriteVariant(Version);
            ws.WriteByte((byte)PersistentState);
            ws.WriteString(_originalName);
        }

        if (_folderId != null && (IsDesignMode || ModelType == ModelType.Permission))
            ws.WriteFieldId(3).WriteGuid(_folderId.Value);
        ws.WriteFieldEnd();
    }

    public virtual void ReadFrom(IInputStream rs)
    {
        _id = rs.ReadLong();
        Name = rs.ReadString()!;
        IsDesignMode = rs.ReadBool();

        if (IsDesignMode)
        {
            Version = rs.ReadVariant();
            PersistentState = (PersistentState)rs.ReadByte();
            _originalName = rs.ReadString();
        }

        while (true)
        {
            var fieldId = rs.ReadFieldId();
            switch (fieldId)
            {
                case 3:
                    _folderId = rs.ReadGuid();
                    break;
                case 0: return;
                default: throw new SerializationException(SerializationError.ReadUnknownFieldId);
            }
        }
    }

    #endregion
}