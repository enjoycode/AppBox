namespace AppBoxCore;

/// <summary>
/// 实体字段成员
/// </summary>
public sealed class EntityFieldMember : EntityMember, IModelReference
{
    internal EntityFieldMember(EntityModel owner) : base(owner, string.Empty, false) { }

    public EntityFieldMember(EntityModel owner, string name, EntityFieldType fieldType,
        bool allowNull, bool isForeignKey = false) :
        base(owner, name, allowNull)
    {
        _fieldType = fieldType;
        IsForeignKey = isForeignKey;
    }

    public override EntityMemberType Type => EntityMemberType.EntityField;

    private bool _isFieldTypeChanged; //字段类型、AllowNull及DefaultValue变更均视为FieldTypeChanged

    //----以下change must call onPropertyChanged----
    private ModelId? _enumModelId; //如果FieldType = Enum,则必须设置相应的EnumModel.ModelId

    //----以下change must call onFieldTypeChanged----
    private EntityFieldType _fieldType;
    private int _length; //仅用于Sql存储设置字符串最大长度(0=无限制)或Decimal整数部分长度
    private int _decimals; //仅用于Sql存储设置Decimal小数部分长度
    private string? _defaultValue; //默认值

    /// <summary>
    /// 是否引用外键
    /// </summary>
    public bool IsForeignKey { get; private set; }

    public EntityFieldType FieldType => _fieldType;

    public ModelId? EnumModelId
    {
        get => _enumModelId;
        set
        {
            _enumModelId = value;
            OnPropertyChanged();
        }
    }

    /// <summary>
    /// 字段默认值
    /// </summary>
    /// <remarks>
    /// 1. DateTime可以设为DateTime.Now
    /// 2. Guid可以设为Guid.Empty
    /// </remarks>
    public string? DefaultValue
    {
        get => _defaultValue;
        internal set
        {
            _defaultValue = value;
            OnFieldTypeChanged();
        }
    }

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

    public bool IsChangeablePrimaryKey =>
        Owner.SqlStoreOptions != null && Owner.SqlStoreOptions.IsChangeablePrimaryKey(MemberId);

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

    internal override void SetAllowNull(bool value)
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

    internal override void AddModelReferences(List<ModelReferenceInfo> list, ModelReferenceType referenceType,
        ModelId modelId, string? memberName, short? entityMemberId)
    {
        if (referenceType == ModelReferenceType.EnumModel && _fieldType == EntityFieldType.Enum &&
            EnumModelId!.Value == modelId)
        {
            var item = new ModelReferenceInfo(this, ModelReferencePosition.EntityFieldMember_EnumModelID,
                Name, string.Empty);
            list.Add(item);
        }
    }

    public void RenameReference(ModelReferenceType sourceType, ModelReferencePosition targetType,
        ModelId modelId, string oldName, string newName)
    {
        //do nothing for rename enum name.
    }

    internal override void UpdateFrom(EntityMember other)
    {
        base.UpdateFrom(other);

        var from = (EntityFieldMember)other;
        //先判断是否数据类型变更
        if (FieldType != from.FieldType || Length != from.Length || Decimals != from.Decimals ||
            AllowNull != from.AllowNull || _defaultValue != from._defaultValue)
            OnFieldTypeChanged();
        //复制属性
        _fieldType = from._fieldType;
        IsForeignKey = from.IsForeignKey;
        Length = from.Length;
        _decimals = from.Decimals;
        EnumModelId = from.EnumModelId;
        _allowNull = from.AllowNull;
        _defaultValue = from._defaultValue;
    }

    #endregion

    #region ====Serialization====

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);

        ws.WriteByte((byte)_fieldType);
        ws.WriteBool(IsForeignKey);
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

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        base.ReadFrom(ref rs);

        _fieldType = (EntityFieldType)rs.ReadByte();
        IsForeignKey = rs.ReadBool();
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