namespace AppBoxCore;

public struct FieldWithOrder
{
    public short MemberId { get; }
    public bool OrderByDesc { get; }

    public FieldWithOrder(short memberId, bool orderByDesc = false)
    {
        MemberId = memberId;
        OrderByDesc = orderByDesc;
    }
}