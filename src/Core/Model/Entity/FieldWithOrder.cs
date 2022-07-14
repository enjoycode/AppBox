namespace AppBoxCore;

/// <summary>
/// 带排序标志的实体成员标识,用于主键或索引等
/// </summary>
public struct FieldWithOrder : IBinSerializable
{
    public short MemberId { get; private set; }
    public bool OrderByDesc { get; private set; }

    public FieldWithOrder(short memberId, bool orderByDesc = false)
    {
        MemberId = memberId;
        OrderByDesc = orderByDesc;
    }

    public void WriteTo(IOutputStream ws)
    {
        ws.WriteShort(MemberId);
        ws.WriteBool(OrderByDesc);
    }

    public void ReadFrom(IInputStream rs)
    {
        MemberId = rs.ReadShort();
        OrderByDesc = rs.ReadBool();
    }
}