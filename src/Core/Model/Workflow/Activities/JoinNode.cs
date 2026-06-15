namespace AppBoxCore;

public sealed class JoinNode : ActivityNode
{
    internal JoinNode() { }

    internal JoinNode(string title)
    {
        Title = title;
    }

    public override byte Type => ActivityType.JoinActivity;

    /// <summary>
    /// 与之对应的ForkNode的分支数量
    /// </summary>
    public int ForkBranchesCount { get; internal set; }

    public FlowLink Next { get; } = new();

    public override IEnumerable<FlowLink> GetOutLinks()
    {
        yield return Next;
    }

    #region ====Serialization====

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);

        ws.WriteVariant(ForkBranchesCount);

        if (Next.Target != null)
        {
            ws.WriteFieldId(1);
            Next.WriteTo(ref ws);
        }

        ws.WriteFieldEnd();
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        base.ReadFrom(ref rs);

        ForkBranchesCount = rs.ReadVariant();

        var propIndex = 0;
        do
        {
            propIndex = rs.ReadFieldId();
            switch (propIndex)
            {
                case 1: Next.ReadFrom(ref rs); break;
                case 0: break;
                default: throw SerializationException.ReadUnknownField(nameof(JoinNode), propIndex);
            }
        } while (propIndex != 0);
    }

    #endregion
}