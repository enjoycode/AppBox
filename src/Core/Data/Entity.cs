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

    /// <summary>
    /// 用于序列化时是否忽略导航属性
    /// </summary>
    private int _writeMemberFlags = 0;

    #region ====PropertyChanged====

    public event Action<short>? PropertyChanged;

    protected virtual void OnPropertyChanged(short memberId) => PropertyChanged?.Invoke(memberId);

    #endregion

    #region ====Serialization====

    /// <summary>
    /// 序列化时忽略当前实体的所有导航属性
    /// </summary>
    internal void IgnoreSerializeNavigateMembersInternal()
    {
        _writeMemberFlags |= EntityMemberWriteFlags.IgnoreNavigates;
    }

    /// <summary>
    /// 写入成员至IEntityMemberWriter，由IEntityMemberWriter及flags决定写入格式
    /// </summary>
    protected internal abstract void WriteMember<T>(short id, ref T ws, int flags) where T : IEntityMemberWriter;

    /// <summary>
    /// 从IEntityMemberReader读取成员值赋值给当前实例
    /// </summary>
    protected internal abstract void ReadMember<T>(short id, ref T rs, int flags) where T : IEntityMemberReader;

    void IBinSerializable.WriteTo(IOutputStream ws)
    {
        //Write members
        foreach (var memberId in AllMembers)
        {
            WriteMember(memberId, ref ws, _writeMemberFlags);
        }

        _writeMemberFlags = EntityMemberWriteFlags.None; //注意写完后重置

        ws.WriteShort(0); //End write members

        // Write DbEntity
        if (this is DbEntity dbEntity)
            dbEntity.WriteTo(ws);
    }

    void IBinSerializable.ReadFrom(IInputStream rs)
    {
        //Read members
        while (true)
        {
            var memberId = rs.ReadShort();
            if (memberId == 0) break;
            ReadMember(memberId, ref rs, 0);
        }

        //Read DbEntity
        if (this is DbEntity dbEntity)
            dbEntity.ReadFrom(rs);
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
    public static T IgnoreSerializeNavigateMembers<T>(this T entity) where T : Entity
    {
        entity.IgnoreSerializeNavigateMembersInternal();
        return entity;
    }
}