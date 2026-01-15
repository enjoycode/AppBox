namespace AppBoxCore;

public abstract class Entity : IBinSerializable
{
    /// <summary>
    /// 实体模型标识
    /// </summary>
    public abstract ModelId ModelId { get; }

    /// <summary>
    /// 用于序列化时获取所有成员标识
    /// </summary>
    protected abstract short[] AllMembers { get; }

    protected virtual EntityType EntityType => EntityType.NonPersistent;

    /// <summary>
    /// 用于序列化时是否忽略导航属性
    /// </summary>
    protected int WriteMemberFlags { get; private set; }

    #region ====PropertyChanged====

    public event Action<short>? PropertyChanged;

    protected void SetField<T>(ref T field, T value, short memberId)
    {
        if (EqualityComparer<T>.Default.Equals(field, value)) return;
        field = value;
        OnPropertyChanged(memberId);
    }

    protected virtual void OnPropertyChanged(short memberId) => PropertyChanged?.Invoke(memberId);

    #endregion

    #region ====Serialization====

    /// <summary>
    /// 序列化时忽略当前实体的所有导航属性
    /// </summary>
    internal void IgnoreSerializeNavigationInternal()
    {
        WriteMemberFlags |= EntityMemberWriteFlags.IgnoreNavigates;
    }

    protected void ResetWriteMemberFlags() => WriteMemberFlags = EntityMemberWriteFlags.None;

    /// <summary>
    /// 写入成员至IEntityMemberWriter，由IEntityMemberWriter及flags决定写入格式
    /// </summary>
    protected internal abstract void WriteMember<T>(short id, ref T ws, int flags) where T : IEntityMemberWriter;

    /// <summary>
    /// 从IEntityMemberReader读取成员值赋值给当前实例
    /// </summary>
    protected internal abstract void ReadMember<T>(short id, ref T rs, int flags) where T : IEntityMemberReader;

    protected virtual void WriteTo(IOutputStream ws)
    {
        ws.WriteByte((byte)EntityType);

        //Write members
        foreach (var memberId in AllMembers)
        {
            WriteMember(memberId, ref ws, WriteMemberFlags);
        }

        WriteMemberFlags = EntityMemberWriteFlags.None; //注意写完后重置
        ws.WriteShort(0); //End write members
    }

    protected virtual void ReadFrom(IInputStream rs)
    {
        rs.ReadByte(); //EntityType

        //Read members
        while (true)
        {
            var memberId = rs.ReadShort();
            if (memberId == 0) break;
            ReadMember(memberId, ref rs, 0);
        }
    }

    void IBinSerializable.WriteTo(IOutputStream ws) => WriteTo(ws);

    void IBinSerializable.ReadFrom(IInputStream rs) => ReadFrom(rs);

    public virtual EntityData ToEntityData()
    {
        var data = new EntityData(ModelId, EntityType);
        var writer = new EntityDataWriter(data);
        foreach (var memberId in AllMembers)
            WriteMember(memberId, ref writer, EntityMemberWriteFlags.None);
        return data;
    }

    #endregion

    #region ====EntityDataWriter====

    internal readonly struct EntityDataWriter : IEntityMemberWriter
    {
        public EntityDataWriter(EntityData data)
        {
            _data = data;
        }

        private readonly EntityData _data;

        public void WriteStringMember(short id, string? value, int flags)
        {
            if (value == null) return;
            _data.AddMember(id, value);
        }

        public void WriteBoolMember(short id, bool? value, int flags)
        {
            if (value == null) return;
            _data.AddMember(id, value.Value);
        }

        public void WriteByteMember(short id, byte? value, int flags)
        {
            if (value == null) return;
            _data.AddMember(id, value.Value);
        }

        public void WriteIntMember(short id, int? value, int flags)
        {
            if (value == null) return;
            _data.AddMember(id, value.Value);
        }

        public void WriteLongMember(short id, long? value, int flags)
        {
            if (value == null) return;
            _data.AddMember(id, value.Value);
        }

        public void WriteFloatMember(short id, float? value, int flags)
        {
            if (value == null) return;
            _data.AddMember(id, value.Value);
        }

        public void WriteDoubleMember(short id, double? value, int flags)
        {
            if (value == null) return;
            _data.AddMember(id, value.Value);
        }

        public void WriteDecimalMember(short id, decimal? value, int flags)
        {
            if (value == null) return;
            _data.AddMember(id, value.Value);
        }

        public void WriteDateTimeMember(short id, DateTime? value, int flags)
        {
            if (value == null) return;
            _data.AddMember(id, value.Value);
        }

        public void WriteGuidMember(short id, Guid? value, int flags)
        {
            if (value == null) return;
            _data.AddMember(id, value.Value);
        }

        public void WriteBinaryMember(short id, byte[]? value, int flags)
        {
            throw new NotImplementedException();
        }

        public void WriteEntityRefMember(short id, Entity? value, int flags)
        {
            throw new NotImplementedException();
        }

        public void WriteEntitySetMember<T>(short id, EntitySet<T>? value, int flags) where T : Entity, new()
        {
            throw new NotImplementedException();
        }
    }

    #endregion
}

public static class EntityExtensions
{
    /// <summary>
    /// 序列化时忽略当前实体的所有导航属性
    /// </summary>
    /// <remarks>
    /// 一般用于树状结构实体由前端向后端传输时，忽略相关的上下级关系，以减少序列化数据量。 注意序列化后会重置
    /// </remarks>
    /// <returns>Self instance</returns>
    public static T IgnoreSerializeNavigation<T>(this T entity) where T : Entity
    {
        entity.IgnoreSerializeNavigationInternal();
        return entity;
    }
}

public enum EntityType : byte
{
    /// <summary>
    /// 非持久性的，eg: DTO or VO
    /// </summary>
    NonPersistent = 0,
    SqlStore = 1,
}