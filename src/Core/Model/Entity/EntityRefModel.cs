namespace AppBoxCore;

public sealed class EntityRefModel : EntityMemberModel
{
    #region ====Ctor====

    internal EntityRefModel(EntityModel owner) : base(owner, string.Empty, false) { }

    /// <summary>
    /// 设计时新建非聚合引用成员
    /// </summary>
    public EntityRefModel(EntityModel owner, string name, long refModelId,
        short[] fkMemberIds, bool foreignConstraint = true) : base(owner, name, true)
    {
        if (fkMemberIds == null || fkMemberIds.Length == 0)
            throw new ArgumentNullException(nameof(fkMemberIds));

        RefModelIds = new List<long> { refModelId };
        IsReverse = false;
        FKMemberIds = fkMemberIds;
        TypeMemberId = 0;
        IsForeignKeyConstraint = foreignConstraint;
    }

    /// <summary>
    /// 设计时新建聚合引用成员
    /// </summary>
    public EntityRefModel(EntityModel owner, string name, List<long> refModelIds,
        short[] fkMemberIds, short typeMemberId, bool foreignConstraint = true) : base(owner, name,
        true)
    {
        if (fkMemberIds == null || fkMemberIds.Length == 0)
            throw new ArgumentNullException(nameof(fkMemberIds));
        if (refModelIds == null || refModelIds.Count <= 0)
            throw new ArgumentNullException(nameof(refModelIds));

        RefModelIds = refModelIds;
        IsReverse = false;
        FKMemberIds = fkMemberIds;
        TypeMemberId = typeMemberId;
        IsForeignKeyConstraint = foreignConstraint;
    }

    #endregion

    #region ====Fields & Properties====

    public override EntityMemberType Type => EntityMemberType.EntityRef;

    /// <summary>
    /// 是否反向引用 eg: A->B , B->A(反向)
    /// </summary>
    public bool IsReverse { get; private set; }

    /// <summary>
    /// 是否强制外键约束
    /// </summary>
    public bool IsForeignKeyConstraint { get; private set; } = true;

    /// <summary>
    /// 引用的实体模型标识号集合，聚合引用有多个
    /// </summary>
    public List<long> RefModelIds { get; private set; }

    /// <summary>
    /// 引用的外键成员标识集合，
    /// 1. SysStore只有一个Id, eg: Order->Customer为Order.CustomerId
    /// 2. SqlStore有一或多个，与引用目标的主键的数量、顺序、类型一致
    /// </summary>
    public short[] FKMemberIds { get; private set; }

    /// <summary>
    /// 聚合引用时的类型字段，存储引用目标的EntityModel.Id
    /// </summary>
    public short TypeMemberId { get; private set; }

    /// <summary>
    /// 是否聚合引用至不同的实体模型
    /// </summary>
    public bool IsAggregationRef => TypeMemberId != 0;

    public EntityRefActionRule UpdateRule { get; private set; } = EntityRefActionRule.Cascade;

    public EntityRefActionRule DeleteRule { get; private set; } = EntityRefActionRule.NoAction;

    // public override bool AllowNull
    // {
    //     get => base.AllowNull;
    //     internal set
    //     {
    //         base.AllowNull = value;
    //         foreach (var fkId in FKMemberIds)
    //         {
    //             Owner.GetMember(fkId, true).AllowNull = value;
    //         }
    //         if (IsAggregationRef)
    //         {
    //             Owner.GetMember(TypeMemberId, true).AllowNull = value;
    //         }
    //     }
    // }

    #endregion

    #region ====Design Methods====

    public override void SetAllowNull(bool value)
    {
        _allowNull = value;
        foreach (var fkId in FKMemberIds)
        {
            Owner.GetMember(fkId, true)!.SetAllowNull(value);
        }

        if (IsAggregationRef)
        {
            Owner.GetMember(TypeMemberId, true)!.SetAllowNull(value);
        }
    }

    #endregion
}

public enum EntityRefActionRule : byte
{
    NoAction = 0,
    Cascade = 1,
    SetNull = 2
}