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

    #region ====Serialization====

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
            WriteMember(memberId, ref ws, EntityMemberWriteFlags.None);
        }

        ws.WriteShort(0); //End write members
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
    }

    #endregion
}

/// <summary>
/// 用于运行时反射获取实体类型对应的模型标识号
/// </summary>
public sealed class EntityModelIdAttribute : Attribute
{
    public readonly long Id;

    public EntityModelIdAttribute(long id)
    {
        Id = id;
    }
}