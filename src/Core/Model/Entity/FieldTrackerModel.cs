namespace AppBoxCore;

public sealed class FieldTrackerModel : EntityMemberModel
{
    internal FieldTrackerModel(EntityModel owner) : this(owner, string.Empty, 0) { }

    public FieldTrackerModel(EntityModel owner, string name, short targetMemberId)
        : base(owner, name, true)
    {
        TargetMemberId = targetMemberId;
    }

    /// <summary>
    /// 跟踪的目标成员的标识号
    /// </summary>
    public short TargetMemberId { get; private set; }

    public EntityFieldModel Target => (EntityFieldModel)Owner.GetMember(TargetMemberId)!;

    public override EntityMemberType Type => EntityMemberType.EntityFieldTracker;

    public override bool AllowNull => Target.AllowNull;

    internal override void SetAllowNull(bool value) => throw new NotSupportedException();

    /// <summary>
    /// 目标是否可修改的主键字段
    /// </summary>
    public bool IsUsedForChangeablePK => Target.IsPrimaryKey;

    #region ====Serialization====

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);
        ws.WriteShort(TargetMemberId);
    }

    public override void ReadFrom(IInputStream rs)
    {
        base.ReadFrom(rs);
        TargetMemberId = rs.ReadShort();
    }

    #endregion
}