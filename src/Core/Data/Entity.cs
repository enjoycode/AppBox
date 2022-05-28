namespace AppBoxCore;

public interface IEntityRuntimeModel
{
    ModelId ModelId { get; }
    short[] AllMembers { get; }
}

public sealed class EntityRuntimeModel : IEntityRuntimeModel
{
    public ModelId ModelId { get; }
    public short[] AllMembers { get; }

    public EntityRuntimeModel(ModelId id, short[] allMembers)
    {
        ModelId = id;
        AllMembers = allMembers;
    }
}

public abstract class Entity : IBinSerializable
{
    /// <summary>
    /// 运行时模型
    /// </summary>
    public abstract IEntityRuntimeModel Model { get; }


    #region ====Serialization====

    /// <summary>
    /// 写入成员至IEntityMemberWriter，由IEntityMemberWriter及flags决定写入格式
    /// </summary>
    public abstract void WriteMember(short id, IEntityMemberWriter ws,
        EntityMemberWriteFlags flags);

    /// <summary>
    /// 读取成员至IEntityMemberReader
    /// </summary>
    public abstract void ReadMember(short id, IEntityMemberReader rs, int flags);

    public void WriteTo(IOutputStream ws)
    {
        //Write members
        foreach (var memberId in Model.AllMembers)
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