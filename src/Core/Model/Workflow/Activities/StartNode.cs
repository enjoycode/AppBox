namespace AppBoxCore;

/// <summary>
/// 开始节点
/// </summary>
public sealed class StartNode : ActivityNode
{
    public StartNode() { }

    public override byte Type => ActivityType.StartActivity;

    public FlowLink Next { get; } = new();

    public override IEnumerable<FlowLink> GetOutLinks()
    {
        yield return Next;
    }

    #region ====Serialization====

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);
        Next.WriteTo(ref ws);
        ws.WriteFieldEnd();
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        base.ReadFrom(ref rs);
        Next.ReadFrom(ref rs);
        rs.ReadFieldId();
    }

    #endregion
}