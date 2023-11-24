namespace AppBoxCore;

public sealed class SqlStoreOptions : IEntityStoreOptions
{
    internal SqlStoreOptions(EntityModel owner)
    {
        _owner = owner;
    }

    public SqlStoreOptions(EntityModel owner, long storeModelId, string? tableNamePrefix)
    {
        _owner = owner;
        _storeModelId = storeModelId;
        _tableNamePrefix = tableNamePrefix;
    }

    private byte _devIndexIdSeq;
    private byte _usrIndexIdSeq;
    private const short MAX_INDEX_ID = 32; //2的5次方, 2bit Layer，1bit惟一标志

    private readonly EntityModel _owner;
    private string? _originalTableNamePrefix;
    private string? _tableNamePrefix;
    private long _storeModelId; //映射的DataStoreModel的标识
    private FieldWithOrder[]? _primaryKeys;
    private IList<SqlIndexModel>? _indexes;

    public DataStoreKind Kind => DataStoreKind.Sql;

    public long StoreModelId => _storeModelId;

    public bool PrimaryKeysHasChanged { get; private set; }

    public bool HasIndexes => _indexes != null && _indexes.Count > 0;
    public bool HasPrimaryKeys => _primaryKeys != null && _primaryKeys.Length > 0;

    public FieldWithOrder[] PrimaryKeys => _primaryKeys!;

    public IList<SqlIndexModel> Indexes => _indexes!;

    private bool IsTableNamePrefixChanged =>
        _originalTableNamePrefix != null && _originalTableNamePrefix != _tableNamePrefix;

    public bool IsTableNameChanged => _owner.IsNameChanged || IsTableNamePrefixChanged;

    private string? OriginalTableNamePrefix => _originalTableNamePrefix ?? _tableNamePrefix;

    #region ====Runtime Methods====

    public bool IsPrimaryKey(short memberId)
    {
        return _primaryKeys != null && _primaryKeys.Any(t => t.MemberId == memberId);
    }

    public bool IsUsedByIndexes(short memberId)
    {
        if (!HasIndexes) return false;
        foreach (var idx in _indexes!)
        {
            if (idx.PersistentState == PersistentState.Deleted) continue; //暂跳过已删除的
            if (idx.Fields.Any(f => f.MemberId == memberId))
                return true;
            if (idx.HasStoringFields && idx.StoringFields!.Contains(memberId))
                return true;
        }

        return false;
    }

    public string GetSqlTableName(bool original, IModelContainer? ctx)
    {
        //TODO:考虑其他命名规则，如直接用Id作为表名或直接指定表名
        if (!original)
            return string.IsNullOrEmpty(_tableNamePrefix) ? _owner.Name : $"{_tableNamePrefix}{_owner.Name}";

        return string.IsNullOrEmpty(OriginalTableNamePrefix)
            ? _owner.OriginalName
            : $"{OriginalTableNamePrefix}{_owner.OriginalName}";
    }

    #endregion

    #region ====Design Methods====

    public void SetPrimaryKeys(FieldWithOrder[]? fields)
    {
        _owner.CheckDesignMode();
        _primaryKeys = fields;

        //同时设置成员的AllowNull = false
        if (fields != null)
        {
            foreach (var pk in fields)
            {
                _owner.GetMember(pk.MemberId, true)!.SetAllowNull(false);
            }
        }

        PrimaryKeysHasChanged = true;
        _owner.OnPropertyChanged();
    }

    public void AddIndex(SqlIndexModel index)
    {
        _owner.CheckDesignMode();

        //TODO:同AddMember获取当前Layer
        var layer = ModelLayer.DEV;
        var seq = layer == ModelLayer.DEV ? ++_devIndexIdSeq : ++_usrIndexIdSeq;
        if (seq >= MAX_INDEX_ID) //TODO: 尝试找空的
            throw new Exception("Index id out of range");
        var indexId = (byte)(seq << 2 | (byte)layer);
        if (index.Unique)
            indexId |= 1 << IdUtil.INDEXID_UNIQUE_OFFSET;
        index.InitIndexId(indexId);
        _indexes ??= new List<SqlIndexModel>();
        _indexes.Add(index);

        _owner.OnPropertyChanged();
    }

    public void AcceptChanges()
    {
        _originalTableNamePrefix = null;
        PrimaryKeysHasChanged = false;

        if (HasIndexes)
        {
            for (var i = _indexes!.Count - 1; i >= 0; i--)
            {
                if (_indexes[i].PersistentState == PersistentState.Deleted)
                    _indexes.RemoveAt(i);
                else
                    _indexes[i].AcceptChanges();
            }
        }
    }

    #endregion

    #region ====Serialization====

    public void WriteTo(IOutputStream ws)
    {
        ws.WriteLong(_storeModelId);
        ws.WriteString(_tableNamePrefix);

        //写入主键
        ws.WriteVariant(_primaryKeys?.Length ?? 0);
        if (_primaryKeys != null)
        {
            for (var i = 0; i < _primaryKeys.Length; i++)
            {
                _primaryKeys[i].WriteTo(ws);
            }
        }

        //写入索引
        ws.WriteVariant(_indexes?.Count ?? 0);
        if (_indexes != null)
        {
            for (var i = 0; i < _indexes.Count; i++)
            {
                _indexes[i].WriteTo(ws);
            }
        }

        if (_owner.IsDesignMode)
        {
            ws.WriteByte(_devIndexIdSeq);
            ws.WriteByte(_usrIndexIdSeq);
            ws.WriteBool(PrimaryKeysHasChanged);
            ws.WriteString(_originalTableNamePrefix);
        }

        ws.WriteFieldEnd(); //保留
    }

    public void ReadFrom(IInputStream rs)
    {
        _storeModelId = rs.ReadLong();
        _tableNamePrefix = rs.ReadString();

        //读取主键
        var count = rs.ReadVariant();
        if (count > 0)
        {
            _primaryKeys = new FieldWithOrder[count];
            for (var i = 0; i < count; i++)
            {
                _primaryKeys[i].ReadFrom(rs);
            }
        }

        //读取索引
        count = rs.ReadVariant();
        if (count > 0)
        {
            _indexes = new List<SqlIndexModel>();
            for (var i = 0; i < count; i++)
            {
                var index = new SqlIndexModel(_owner);
                index.ReadFrom(rs);
                _indexes.Add(index);
            }
        }

        if (_owner.IsDesignMode)
        {
            _devIndexIdSeq = rs.ReadByte();
            _usrIndexIdSeq = rs.ReadByte();
            PrimaryKeysHasChanged = rs.ReadBool();
            _originalTableNamePrefix = rs.ReadString();
        }

        rs.ReadVariant(); //保留
    }

    #endregion
}