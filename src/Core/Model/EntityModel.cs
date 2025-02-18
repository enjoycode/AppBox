using System.Diagnostics;

namespace AppBoxCore;

/// <summary>
/// 实体模型，描述成员及存储选项
/// </summary>
public sealed class EntityModel : ModelBase, IComparable<EntityModel>
{
    public EntityModel() { }
    public EntityModel(ModelId id, string name) : base(id, name) { }

    private const short MaxMemberId = 512;

    private short _devMemberIdSeq;
    private short _usrMemberIdSeq;
    private readonly List<EntityMemberModel> _members = new(); ////注意已按memberId排序
    private IEntityStoreOptions? _storeOptions;

    public IReadOnlyList<EntityMemberModel> Members => _members;

    public DataStoreKind DataStoreKind => _storeOptions?.Kind ?? DataStoreKind.None;

    public IEntityStoreOptions? StoreOptions => _storeOptions;
    public SqlStoreOptions? SqlStoreOptions => _storeOptions as SqlStoreOptions;

    #region ====GetMember Methods====

    public EntityMemberModel? GetMember(ReadOnlySpan<char> name, bool throwOnNotExists = true)
    {
        foreach (var t in Members)
        {
            if (t.Name.AsSpan().SequenceEqual(name))
                return t;
        }

        if (throwOnNotExists)
            throw new Exception($"Member not exists :{Name}.{name.ToString()}");
        return null;
    }

    public EntityMemberModel? GetMember(short id, bool throwOnNotExists = true)
    {
        var m = _members.SingleOrDefault(t => t.MemberId == id);
        if (m == null && throwOnNotExists)
            throw new Exception($"Member not exists with id:{id}");
        return m;
    }

    private EntityMemberModel? BinarySearch(short id)
    {
        var low = 0;
        var high = _members.Count - 1;

        while (low <= high)
        {
            var mid = low + high >> 1;
            var midVal = _members[mid];
            var cmp = midVal.MemberId.CompareTo(id);
            if (cmp < 0)
            {
                low = mid + 1;
            }
            else
            {
                if (cmp <= 0)
                    return midVal;
                high = mid - 1;
            }
        }

        return null;
    }

    #endregion

    #region ====Design Methods====

    internal void BindToSqlStore(long storeId, string? tableNamePrefix)
    {
        _storeOptions = new SqlStoreOptions(this, storeId, tableNamePrefix);
    }

    /// <summary>
    /// Only for StoreInitiator
    /// </summary>
    internal void AddSysMember(EntityMemberModel member, short id)
    {
        CheckDesignMode();
        member.InitMemberId(id); //已处理Layer标记
        _members.Add(member);
        _members.Sort((a, b) => a.MemberId.CompareTo(b.MemberId));
    }

    internal void AddMember(EntityMemberModel member, bool byImport = false)
    {
        CheckDesignMode();
        Debug.Assert(member.Owner == this);

        if (!byImport) //非导入的需要生成成员标识
        {
            //TODO:通过设计时上下文获取ApplicationModel是否导入，从而确认当前Layer
            var layer = ModelLayer.DEV;
            var seq = layer == ModelLayer.DEV ? ++_devMemberIdSeq : ++_usrMemberIdSeq;
            if (seq >= MaxMemberId)
            {
                //TODO:尝试找空的
                throw new NotImplementedException("Member id out of range");
            }

            member.InitMemberId(IdUtil.MakeMemberId(layer, seq));
        }

        _members.Add(member);
        _members.Sort((a, b) => a.MemberId.CompareTo(b.MemberId));

        if (!member.AllowNull)
            ChangeSchemaVersion();

        OnPropertyChanged();
    }

    /// <summary>
    /// 删除成员，如果是EntityRef包含其隐藏成员
    /// </summary>
    internal void RemoveMember(EntityMemberModel member)
    {
        CheckDesignMode();

        //如果实体是新建的或成员是新建的直接移除
        if (PersistentState == PersistentState.Detached || member.PersistentState == PersistentState.Detached)
        {
            if (member is EntityRefModel entityRef)
            {
                foreach (var fk in entityRef.FKMemberIds)
                {
                    _members.Remove(GetMember(fk)!);
                }

                if (entityRef.IsAggregationRef)
                    _members.Remove(GetMember(entityRef.TypeMemberId)!);
            }
            else if (member is EntityFieldModel)
            {
                //同时删除可能存在的跟踪成员
                var tracker = _members
                    .SingleOrDefault(m => m.Type == EntityMemberType.EntityFieldTracker &&
                                          ((FieldTrackerModel)m).TargetMemberId == member.MemberId);
                if (tracker != null)
                    _members.Remove(tracker);
            }

            _members.Remove(member);
            return;
        }

        //否则仅标为删除状态
        member.AsDeleted();
        if (member is EntityRefModel entityRefModel)
        {
            foreach (var fk in entityRefModel.FKMemberIds)
            {
                GetMember(fk)!.AsDeleted();
            }

            if (entityRefModel.IsAggregationRef)
                GetMember(entityRefModel.TypeMemberId)!.AsDeleted();
        }
        else if (member is EntityFieldModel)
        {
            //同时删除可能存在的跟踪成员
            var tracker = _members
                .SingleOrDefault(m => m.Type == EntityMemberType.EntityFieldTracker &&
                                      ((FieldTrackerModel)m).TargetMemberId == member.MemberId);
            tracker?.AsDeleted();
        }

        ChangeSchemaVersion();
        OnPropertyChanged();
    }

    /// <summary>
    /// 重命名成员
    /// </summary>
    internal void RenameMember(string oldName, string newName)
    {
        CheckDesignMode();
        if (string.IsNullOrEmpty(oldName) || string.IsNullOrEmpty(newName))
            throw new ArgumentNullException();
        if (oldName == newName)
        {
            // Log.Warn("Rename: name is same");
            return;
        }

        var m = GetMember(oldName)!;
        m.RenameTo(newName);
    }

    internal void ChangeSchemaVersion()
    {
        // if (persistentState() != PersistentState.Detached && sysStoreOptions() != null) {
        //     ((SysStoreOptions) _storeOptions).changeSchemaVersion();
        // }
    }

    internal override void AcceptChanges()
    {
        base.AcceptChanges();

        for (var i = _members.Count - 1; i >= 0; i--)
        {
            if (_members[i].PersistentState == PersistentState.Deleted)
                _members.RemoveAt(i);
            else
                _members[i].AcceptChanges();
        }

        StoreOptions?.AcceptChanges();
    }

    internal void AddModelReferences(List<ModelReferenceInfo> list,
        ModelReferenceType referenceType,
        ModelId modelId, string? memberName, short? entityMemberId)
    {
        //处理ToStringExpression
        // if (FindModelReferenceVisitor.ContainsModelReference(this._toStringExpression, referenceType, modelID, memberName))
        // {
        //     list.Add(new ModelReferenceInfo(this, ModelReferencePosition.EntityModel_ToStringExpression,
        //         this.Name, this._toStringExpression.ToString()));
        // }

        //处理各成员
        foreach (var member in _members)
        {
            member.AddModelReferences(list, referenceType, modelId, memberName, entityMemberId);
        }

        // //处理各行为
        // if (_actions != null && _actions.Count > 0)
        // {
        //     foreach (EntityAction act in Actions.Values)
        //     {
        //         act.AddModelReferences(list, referenceType, modelID, memberName);
        //     }
        // }
    }

    #endregion

    #region ====Serialization====

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);

        //写入成员
        ws.WriteVariant(_members.Count);
        foreach (var member in _members)
        {
            ws.WriteByte((byte)member.Type);
            member.WriteTo(ws);
        }

        //写入存储配置
        ws.WriteByte(_storeOptions == null ? (byte)0 : (byte)_storeOptions.Kind);
        _storeOptions?.WriteTo(ws);

        if (IsDesignMode)
        {
            ws.WriteShort(_devMemberIdSeq);
            ws.WriteShort(_usrMemberIdSeq);
        }

        ws.WriteFieldEnd(); //保留
    }

    public override void ReadFrom(IInputStream rs)
    {
        base.ReadFrom(rs);

        //读取成员
        var count = rs.ReadVariant();
        for (var i = 0; i < count; i++)
        {
            var member = MakeMemberByType(rs.ReadByte());
            member.ReadFrom(rs);
            _members.Add(member);
        }

        //读取存储配置
        var storeType = rs.ReadByte();
        if (storeType != 0)
        {
            _storeOptions = MakeStoreOptionsByType(storeType);
            _storeOptions.ReadFrom(rs);
        }

        if (IsDesignMode)
        {
            _devMemberIdSeq = rs.ReadShort();
            _usrMemberIdSeq = rs.ReadShort();
        }

        rs.ReadVariant(); //保留
    }

    private EntityMemberModel MakeMemberByType(byte memberType) => (EntityMemberType)memberType switch
    {
        EntityMemberType.EntityField => new EntityFieldModel(this),
        EntityMemberType.EntityFieldTracker => new FieldTrackerModel(this),
        EntityMemberType.EntityRef => new EntityRefModel(this),
        EntityMemberType.EntitySet => new EntitySetModel(this),
        _ => throw new NotImplementedException(memberType.ToString())
    };

    private IEntityStoreOptions MakeStoreOptionsByType(byte type) => (DataStoreKind)type switch
    {
        DataStoreKind.Sql => new SqlStoreOptions(this),
        _ => throw new NotImplementedException(type.ToString())
    };

    #endregion

    #region ====IComparable====

    public int CompareTo(EntityModel? other)
    {
        if (other == null) return 1;
        
        //判断当前对象有没有EntityRef引用成员至目标对象, 如果引用则大于other对象
        var refs = Members
            .Where(t => t.Type == EntityMemberType.EntityRef)
            .Cast<EntityRefModel>();
        if (refs.Any(rm => rm.RefModelIds.Any(refModelId => refModelId == other.Id)))
        {
            return other.PersistentState == PersistentState.Deleted ? -1 : 1;
        }

        //反过来判断,应该不需要
        var otherRefs = other.Members
            .Where(t => t.Type == EntityMemberType.EntityRef)
            .Cast<EntityRefModel>();
        if (otherRefs.Any(m => m.RefModelIds.Any()))
        {
            return other.PersistentState == PersistentState.Deleted ? 1 : -1;
        }

        return Id.CompareTo(other.Id);
    }

    #endregion
}