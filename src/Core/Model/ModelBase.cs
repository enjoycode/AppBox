namespace AppBoxCore;

/// <summary>
/// 模型基类，实例分为设计时与运行时
/// </summary>
public abstract class ModelBase : IBinSerializable
{
    private ModelId _id;
    private string _name;
    private string? _originalName;
    private int _version;
    private bool _designMode;
    private PersistentState _persistentState;
    private Guid? _folderId;

    protected ModelBase(ModelId id, string name)
    {
        _designMode = true;
        _id = id;
        _name = name;
        _persistentState = PersistentState.Detached;
    }

    public ModelLayer ModelLayer => _id.Layer;
    public ModelType ModelType => _id.Type;

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

    protected void CheckDesignMode()
    {
        if (!_designMode) throw new InvalidOperationException();
    }

    protected void OnPropertyChanged()
    {
        if (_persistentState == PersistentState.Unchanged)
            _persistentState = PersistentState.Modified;
    }

    #endregion

    #region ====Serialization====

    public virtual void WriteTo(IOutputStream ws)
    {
        ws.WriteLong(_id.EncodedValue);
        ws.WriteString(_name);
        ws.WriteBool(_designMode);

        if (_designMode)
        {
            ws.WriteFieldId(1).WriteVariant(_version);
            ws.WriteFieldId(2).WriteByte((byte)_persistentState);
            if (_folderId != null)
                ws.WriteFieldId(3).WriteGuid(_folderId.Value);
            if (_originalName != null)
                ws.WriteFieldId(4).WriteString(_originalName);
        }
        else if (ModelType == ModelType.Permission)
        {
            if (_folderId != null)
                ws.WriteFieldId(3).WriteGuid(_folderId.Value);
        }

        ws.WriteFieldEnd();
    }

    public virtual void ReadFrom(IInputStream rs)
    {
        _id = new ModelId(rs.ReadLong());
        _name = rs.ReadString()!;
        _designMode = rs.ReadBool();

        while (true)
        {
            var fieldId = rs.ReadFieldId();
            switch (fieldId)
            {
                case 1:
                    _version = rs.ReadVariant();
                    break;
                case 2:
                    _persistentState = (PersistentState)rs.ReadByte();
                    break;
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