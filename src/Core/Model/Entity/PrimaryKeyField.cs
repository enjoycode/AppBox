namespace AppBoxCore;

/// <summary>
/// 主键字段
/// </summary>
public struct PrimaryKeyField : IBinSerializable, IEquatable<PrimaryKeyField>
{
    public short MemberId { get; private set; }

    public bool OrderByDesc { get; private set; }

    /// <summary>
    /// 主键字段是否允许修改，是则会关联TrackerMember
    /// </summary>
    public bool AllowChange { get; private set; }

    /// <summary>
    /// 如果主键字段允许修改，指向TrackerMember,否则无意义
    /// </summary>
    public short TrackerMemberId { get; internal set; }

    public PrimaryKeyField(short memberId, bool allowChange, bool orderByDesc = false)
    {
        MemberId = memberId;
        OrderByDesc = orderByDesc;
        AllowChange = allowChange;
        TrackerMemberId = 0;
    }

    public void WriteTo(IOutputStream ws)
    {
        ws.WriteShort(MemberId);
        ws.WriteBool(OrderByDesc);
        ws.WriteBool(AllowChange);
        if (AllowChange) ws.WriteShort(TrackerMemberId);

        ws.WriteFieldEnd(); //保留
    }

    public void ReadFrom(IInputStream rs)
    {
        MemberId = rs.ReadShort();
        OrderByDesc = rs.ReadBool();
        AllowChange = rs.ReadBool();
        if (AllowChange) TrackerMemberId = rs.ReadShort();

        rs.ReadVariant(); //保留
    }

    public bool Equals(PrimaryKeyField other) => MemberId == other.MemberId;

    public override bool Equals(object? obj) => obj is PrimaryKeyField other && Equals(other);

    public override int GetHashCode() => MemberId.GetHashCode();
}