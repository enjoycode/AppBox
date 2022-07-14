namespace AppBoxCore;

/// <summary>
/// 带排序标志的实体成员标识,用于主键或索引等
/// </summary>
[BinSerializable(BinSerializePolicy.Compact)]
public partial struct FieldWithOrder
{
    [Field(1)] public short MemberId { get; private set; }
    [Field(2)] public bool OrderByDesc { get; private set; }

    public FieldWithOrder(short memberId, bool orderByDesc = false)
    {
        MemberId = memberId;
        OrderByDesc = orderByDesc;
    }
}