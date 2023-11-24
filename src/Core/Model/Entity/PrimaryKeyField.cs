namespace AppBoxCore;

/// <summary>
/// 主键字段
/// </summary>
public struct PrimaryKeyField : IBinSerializable
{
    public short MemberId { get; private set; }
    public bool OrderByDesc { get; private set; }

    public PrimaryKeyField(short memberId, bool orderByDesc = false)
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