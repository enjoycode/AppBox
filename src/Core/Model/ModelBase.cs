namespace AppBoxCore;

/// <summary>
/// 模型基类，实例分为设计时与运行时
/// </summary>
public abstract class ModelBase : IBinSerializable
{
    protected ModelBase() { }

    protected ModelBase(ModelId id, string name)
    {
        _designMode = true;
        _id = id;
        _name = name;
        _persistentState = PersistentState.Detached;
    }

    private ModelId _id;
    private string _name;
    private string? _originalName;
    private int _version;
    private bool _designMode;
    private PersistentState _persistentState;
    private Guid? _folderId;

    public ModelLayer ModelLayer => _id.Layer;
    public ModelType ModelType => _id.Type;

    public ModelId Id => _id;
    public int AppId => Id.AppId;
    public string Name => _name;
    public string OriginalName => _originalName ?? _name;
    public int Version => _version;

    public Guid? FolderId
    {
        get => _folderId;
        set => _folderId = value;
    }

    public bool IsDesignMode => _designMode;

    public PersistentState PersistentState => _persistentState;

    #region ====Design Methods====

    public bool IsNameChanged => _originalName != null && _originalName != _name;

    public void RenameTo(string newName)
    {
        CheckDesignMode();

        //如果已经重命名过，不再修改_originalName
        if (_originalName == null && _persistentState != PersistentState.Detached)
            _originalName = _name;
        _name = newName;
        OnPropertyChanged();
    }

    public void IncreaseVersion() => _version++;

    public void AcceptChanges()
    {
        if (_persistentState == PersistentState.Unchanged) return;
        _persistentState = _persistentState == PersistentState.Deleted
            ? PersistentState.Detached
            : PersistentState.Unchanged;
        _originalName = null;
    }

    public void Delete()
    {
        if (_persistentState != PersistentState.Detached)
            _persistentState = PersistentState.Deleted;
    }

    public void CheckDesignMode()
    {
        if (!_designMode) throw new InvalidOperationException();
    }

    protected internal void OnPropertyChanged()
    {
        if (_persistentState == PersistentState.Unchanged)
            _persistentState = PersistentState.Modified;
    }

    #endregion

    #region ====Serialization====

    public virtual void WriteTo(IOutputStream ws)
    {
        ws.WriteLong(_id);
        ws.WriteString(_name);
        ws.WriteBool(_designMode);

        if (_designMode)
        {
            ws.WriteVariant(_version);
            ws.WriteByte((byte)_persistentState);
            ws.WriteString(_originalName);
        }

        if (_folderId != null && (_designMode || ModelType == ModelType.Permission))
            ws.WriteFieldId(3).WriteGuid(_folderId.Value);
        ws.WriteFieldEnd();
    }

    public virtual void ReadFrom(IInputStream rs)
    {
        _id = rs.ReadLong();
        _name = rs.ReadString()!;
        _designMode = rs.ReadBool();

        if (_designMode)
        {
            _version = rs.ReadVariant();
            _persistentState = (PersistentState)rs.ReadByte();
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