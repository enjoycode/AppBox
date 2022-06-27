namespace AppBoxCore;

public sealed class DataFieldModel : EntityMemberModel
{
    internal DataFieldModel(EntityModel owner) : base(owner, string.Empty, false) { }

    public DataFieldModel(EntityModel owner, string name, DataFieldType dataType, bool allowNull) :
        base(owner, name, allowNull)
    {
        _dataType = dataType;
    }

    public override EntityMemberType Type => EntityMemberType.DataField;

    private bool _isForeignKey; //是否引用外键

    private bool _isDataTypeChanged; //字段类型、AllowNull及DefaultValue变更均视为DataTypeChanged

    //----以下change must call onPropertyChanged----
    private ModelId? _enumModelId; //如果DataType = Enum,则必须设置相应的EnumModel.ModelId

    //----以下change must call onDataTypeChanged----
    private DataFieldType _dataType;
    private int _length; //仅用于Sql存储设置字符串最大长度(0=无限制)或Decimal整数部分长度
    private int _decimals; //仅用于Sql存储设置Decimal小数部分长度
    private string? _defaultValue; //默认值

    public bool IsForeignKey => _isForeignKey;
    public DataFieldType DataType => _dataType;
    public ModelId? EnumModelId => _enumModelId;

    public int Length
    {
        get => _length;
        set
        {
            _length = value;
            OnDataTypeChanged();
        }
    }

    public int Decimals => _decimals;

    public bool IsDataTypeChanged => _isDataTypeChanged;

    public bool IsPrimaryKey =>
        Owner.SqlStoreOptions != null && Owner.SqlStoreOptions.IsPrimaryKey(MemberId);

    /// <summary>
    /// 保留用于根据规则生成Sql列的名称, eg:相同前缀、命名规则等
    /// </summary>
    public string SqlColName => Name;

    public string SqlColOriginalName => OriginalName;

    #region ====Design Methods====

    private void OnDataTypeChanged()
    {
        if (PersistentState == PersistentState.Unchanged)
        {
            _isDataTypeChanged = true;
            OnPropertyChanged();
        }
    }

    public override void SetAllowNull(bool value)
    {
        if (_allowNull != value)
        {
            _allowNull = value;
            OnDataTypeChanged(); //TODO: !allowNull -> allowNull
        }
    }

    // public void SetDefaultValue(string value)
    // {
    //     _defaultValue = _dataType switch
    //     {
    //         DataFieldType.String => value,
    //         DataFieldType.DateTime => DateTime.Parse(value),
    //         DataFieldType.Byte => byte.Parse(value),
    //         DataFieldType.Short => short.Parse(value),
    //         DataFieldType.Int => int.Parse(value),
    //         DataFieldType.Long => long.Parse(value),
    //         DataFieldType.Decimal => decimal.Parse(value),
    //         DataFieldType.Float => float.Parse(value),
    //         DataFieldType.Double => double.Parse(value),
    //         DataFieldType.Bool => bool.Parse(value),
    //         DataFieldType.Guid => Guid.Parse(value),
    //         _ => throw new NotImplementedException()
    //     };
    //
    //     if (!AllowNull)
    //         OnDataTypeChanged();
    // }

    #endregion

    #region ====Serialization====

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);

        ws.WriteByte((byte)_dataType);
        ws.WriteBool(_isForeignKey);
        if (_dataType == DataFieldType.Enum)
            ws.WriteLong(_enumModelId!.Value);
        else if (_dataType == DataFieldType.String)
            ws.WriteVariant(_length);
        else if (_dataType == DataFieldType.Decimal)
        {
            ws.WriteVariant(_length);
            ws.WriteVariant(_decimals);
        }

        ws.WriteString(_defaultValue);

        if (Owner.IsDesignMode)
            ws.WriteBool(_isDataTypeChanged);
    }

    public override void ReadFrom(IInputStream rs)
    {
        base.ReadFrom(rs);

        _dataType = (DataFieldType)rs.ReadByte();
        _isForeignKey = rs.ReadBool();
        if (_dataType == DataFieldType.Enum)
            _enumModelId = rs.ReadLong();
        else if (_dataType == DataFieldType.String)
            _length = rs.ReadVariant();
        else if (_dataType == DataFieldType.Decimal)
        {
            _length = rs.ReadVariant();
            _decimals = rs.ReadVariant();
        }

        _defaultValue = rs.ReadString();

        if (Owner.IsDesignMode)
            _isDataTypeChanged = rs.ReadBool();
    }

    #endregion
}