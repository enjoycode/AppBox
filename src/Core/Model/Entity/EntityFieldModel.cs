namespace AppBoxCore;

public sealed class EntityFieldModel : EntityMemberModel
{
    internal EntityFieldModel(EntityModel owner) : base(owner, string.Empty, false) { }

    public EntityFieldModel(EntityModel owner, string name, EntityFieldType fieldType,
        bool allowNull) :
        base(owner, name, allowNull)
    {
        _fieldType = fieldType;
    }

    public override EntityMemberType Type => EntityMemberType.EntityField;

    private bool _isForeignKey; //是否引用外键

    private bool _isFieldTypeChanged; //字段类型、AllowNull及DefaultValue变更均视为FieldTypeChanged

    //----以下change must call onPropertyChanged----
    private ModelId? _enumModelId; //如果FieldType = Enum,则必须设置相应的EnumModel.ModelId

    //----以下change must call onFieldTypeChanged----
    private EntityFieldType _fieldType;
    private int _length; //仅用于Sql存储设置字符串最大长度(0=无限制)或Decimal整数部分长度
    private int _decimals; //仅用于Sql存储设置Decimal小数部分长度
    private string? _defaultValue; //默认值

    public bool IsForeignKey => _isForeignKey;
    public EntityFieldType FieldType => _fieldType;
    public ModelId? EnumModelId => _enumModelId;

    public int Length
    {
        get => _length;
        set
        {
            _length = value;
            OnFieldTypeChanged();
        }
    }

    public int Decimals => _decimals;

    public bool IsFieldTypeChanged => _isFieldTypeChanged;

    public bool IsPrimaryKey =>
        Owner.SqlStoreOptions != null && Owner.SqlStoreOptions.IsPrimaryKey(MemberId);

    /// <summary>
    /// 保留用于根据规则生成Sql列的名称, eg:相同前缀、命名规则等
    /// </summary>
    public string SqlColName => Name;

    public string SqlColOriginalName => OriginalName;

    #region ====Design Methods====

    private void OnFieldTypeChanged()
    {
        if (PersistentState == PersistentState.Unchanged)
        {
            _isFieldTypeChanged = true;
            OnPropertyChanged();
        }
    }

    public override void SetAllowNull(bool value)
    {
        if (_allowNull != value)
        {
            _allowNull = value;
            OnFieldTypeChanged(); //TODO: !allowNull -> allowNull
        }
    }

    public bool IsUsedByIndexes()
    {
        //TODO: other db type
        if (Owner.SqlStoreOptions != null)
            return Owner.SqlStoreOptions.IsUsedByIndexes(MemberId);
        return false;
    }

    // public void SetDefaultValue(string value)
    // {
    //     _defaultValue = _fieldType switch
    //     {
    //         EntityFieldType.String => value,
    //         EntityFieldType.DateTime => DateTime.Parse(value),
    //         EntityFieldType.Byte => byte.Parse(value),
    //         EntityFieldType.Short => short.Parse(value),
    //         EntityFieldType.Int => int.Parse(value),
    //         EntityFieldType.Long => long.Parse(value),
    //         EntityFieldType.Decimal => decimal.Parse(value),
    //         EntityFieldType.Float => float.Parse(value),
    //         EntityFieldType.Double => double.Parse(value),
    //         EntityFieldType.Bool => bool.Parse(value),
    //         EntityFieldType.Guid => Guid.Parse(value),
    //         _ => throw new NotImplementedException()
    //     };
    //
    //     if (!AllowNull)
    //         OnFieldTypeChanged();
    // }

    #endregion

    #region ====Serialization====

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);

        ws.WriteByte((byte)_fieldType);
        ws.WriteBool(_isForeignKey);
        if (_fieldType == EntityFieldType.Enum)
            ws.WriteLong(_enumModelId!.Value);
        else if (_fieldType == EntityFieldType.String)
            ws.WriteVariant(_length);
        else if (_fieldType == EntityFieldType.Decimal)
        {
            ws.WriteVariant(_length);
            ws.WriteVariant(_decimals);
        }

        ws.WriteString(_defaultValue);

        if (Owner.IsDesignMode)
            ws.WriteBool(_isFieldTypeChanged);
    }

    public override void ReadFrom(IInputStream rs)
    {
        base.ReadFrom(rs);

        _fieldType = (EntityFieldType)rs.ReadByte();
        _isForeignKey = rs.ReadBool();
        if (_fieldType == EntityFieldType.Enum)
            _enumModelId = rs.ReadLong();
        else if (_fieldType == EntityFieldType.String)
            _length = rs.ReadVariant();
        else if (_fieldType == EntityFieldType.Decimal)
        {
            _length = rs.ReadVariant();
            _decimals = rs.ReadVariant();
        }

        _defaultValue = rs.ReadString();

        if (Owner.IsDesignMode)
            _isFieldTypeChanged = rs.ReadBool();
    }

    #endregion
}