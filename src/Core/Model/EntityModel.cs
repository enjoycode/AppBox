using System.Diagnostics;

namespace AppBoxCore;

/// <summary>
/// 实体模型，描述成员及存储选项
/// </summary>
public sealed class EntityModel : ModelBase, IComparable<EntityModel>
{
    public EntityModel() { }
    public EntityModel(ModelId id, string name) : base(id, name) { }

    public const short MaxMemberId = 512;

    private short _devMemberIdSeq;
    private short _usrMemberIdSeq;
    private readonly List<EntityMemberModel> _members = new(); ////注意已按memberId排序
    private IEntityStoreOptions? _storeOptions = null;

    public IReadOnlyList<EntityMemberModel> Members => _members;

    public DataStoreKind DataStoreKind => _storeOptions?.Kind ?? DataStoreKind.None;

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

    public void BindToSqlStore(long storeId)
    {
        _storeOptions = new SqlStoreOptions(this, storeId);
    }

    /// <summary>
    /// Only for StoreInitiator
    /// </summary>
    public void AddSysMember(EntityMemberModel member, short id)
    {
        CheckDesignMode();
        member.InitMemberId(id); //已处理Layer标记
        _members.Add(member);
        _members.Sort((a, b) => a.MemberId.CompareTo(b.MemberId));
    }

    public void AddMember(EntityMemberModel member, bool byImport = false)
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

    public void ChangeSchemaVersion()
    {
        // if (persistentState() != PersistentState.Detached && sysStoreOptions() != null) {
        //     ((SysStoreOptions) _storeOptions).changeSchemaVersion();
        // }
    }

    #endregion

    #region ====Runtime Methods====

    public string GetSqlTableName(bool original, IDesignContext? ctx)
    {
        //TODO:暂简单实现
        return original ? OriginalName : Name;
//         Debug.Assert(SqlStoreOptions != null);
// #if FUTURE
//             return Name; //暂直接返回名称
// #else
//         if (!original && _sqlTableName_cached != null)
//             return _sqlTableName_cached;
//
//         var name = original ? OriginalName : Name;
//         //TODO:根据规则生成，另注意默认存储使用默认规则
//         //if ((SqlStoreOptions.DataStoreModel.NameRules & DataStoreNameRules.AppPrefixForTable)
//         //    == DataStoreNameRules.AppPrefixForTable)
//         //{
//         ApplicationModel app = ctx == null ? RuntimeContext.Current.GetApplicationModelAsync(AppId).Result
//             : ctx.GetApplicationModel(AppId);
//         if (original) return $"{app.Name}.{name}";
//
//         _sqlTableName_cached = $"{app.Name}.{name}";
//         //}
//         //else
//         //{
//         //    _sqlTableName_cached = name;
//         //}
//         return _sqlTableName_cached;
// #endif
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

    private EntityMemberModel MakeMemberByType(byte memberType)
    {
        return (EntityMemberType)memberType switch
        {
            EntityMemberType.DataField => new DataFieldModel(this),
            EntityMemberType.EntityRef => new EntityRefModel(this),
            EntityMemberType.EntitySet => new EntitySetModel(this),
            _ => throw new NotImplementedException(memberType.ToString())
        };
    }

    private IEntityStoreOptions MakeStoreOptionsByType(byte type)
    {
        return (DataStoreKind)type switch
        {
            DataStoreKind.Sql => new SqlStoreOptions(this),
            _ => throw new NotImplementedException(type.ToString())
        };
    }

    #endregion

    #region ====IComparable====

    public int CompareTo(EntityModel other)
    {
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