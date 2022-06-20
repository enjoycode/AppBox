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
    public abstract void WriteMember(short id, IEntityMemberWriter ws, int flags);

    /// <summary>
    /// 从IEntityMemberReader读取并设置成员
    /// </summary>
    public abstract void ReadMember(short id, IEntityMemberReader rs, int flags);

    public void WriteTo(IOutputStream ws)
    {
        //Write members
        foreach (var memberId in AllMembers)
        {
            WriteMember(memberId, ws, EntityMemberWriteFlags.None);
        }

        ws.WriteShort(0); //End write members
    }

    public void ReadFrom(IInputStream rs)
    {
        //Read members
        while (true)
        {
            var memberId = rs.ReadShort();
            if (memberId == 0) break;
            ReadMember(memberId, rs, 0);
        }
    }

    #endregion
}