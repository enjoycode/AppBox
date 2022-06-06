namespace AppBoxCore;

public sealed class EntitySetModel : EntityMemberModel
{
    public EntitySetModel(EntityModel owner, string name, long refModelId, short refMemberId)
        : base(owner, name, true)
    {
        RefModelId = refModelId;
        RefMemberId = refMemberId;
    }

    /// <summary>
    /// 引用的实体模型标识号，如Order->OrderDetail，则指向OrderDetail的模型标识
    /// </summary>
    public long RefModelId { get; private set; }

    /// <summary>
    /// 引用的EntityRef成员标识，如Order->OrderDetail，则指向OrderDetail.Order成员标识
    /// </summary>
    public short RefMemberId { get; private set; }

    public override EntityMemberType Type => EntityMemberType.EntitySet;

    public override void SetAllowNull(bool value)
    {
        //do noting, always allow null
    }

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);
        ws.WriteLong(RefModelId);
        ws.WriteShort(RefMemberId);
    }

    public override void ReadFrom(IInputStream rs)
    {
        base.ReadFrom(rs);

        RefModelId = rs.ReadLong();
        RefMemberId = rs.ReadShort();
    }
}