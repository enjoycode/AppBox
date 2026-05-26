namespace AppBoxCore;

/// <summary>
/// 带排序标志的实体成员标识,用于索引字段
/// </summary>
public struct OrderedField : IBinSerializable
{
    public short MemberId { get; private set; }
    public bool OrderByDesc { get; private set; }

    public OrderedField(short memberId, bool orderByDesc = false)
    {
        MemberId = memberId;
        OrderByDesc = orderByDesc;
    }

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteShort(MemberId);
        ws.WriteBool(OrderByDesc);
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        MemberId = rs.ReadShort();
        OrderByDesc = rs.ReadBool();
    }
}