using System.Diagnostics;

namespace AppBoxCore;

public sealed class EntityModel : ModelBase
{
    public EntityModel(ModelId id, string name) : base(id, name) { }

    public const short MaxMemberId = 512;

    private short _devMemberIdSeq;
    private short _usrMemberIdSeq;
    private readonly List<EntityMemberModel> _members = new(); ////注意已按memberId排序
    private IEntityStoreOption? _storeOption = null;

    public IReadOnlyList<EntityMemberModel> Members => _members;

    public DataStoreKind DataStoreKind
    {
        get
        {
            if (_storeOption == null) return DataStoreKind.None;
            throw new NotImplementedException(); //return _storeOption.
        }
    }

    #region ====GetMember Methods====

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

        //TODO: 写入存储配置
        ws.WriteByte(0);

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

        //TODO: 读取存储配置
        var storeType = rs.ReadByte();

        if (IsDesignMode)
        {
            _devMemberIdSeq = rs.ReadShort();
            _usrMemberIdSeq = rs.ReadShort();
        }

        rs.ReadVariant(); //保留
    }

    private static EntityMemberModel MakeMemberByType(byte memberType)
    {
        // if (memberType == EntityMemberType.DataField.value) {
        //     return new DataFieldModel(this);
        // } else if (memberType == EntityMemberType.EntityRef.value) {
        //     return new EntityRefModel(this);
        // } else if (memberType == EntityMemberType.EntitySet.value) {
        //     return new EntitySetModel(this);
        // }
        throw new NotSupportedException("Unknown EntityMember type: " + memberType);
    }

    #endregion
}