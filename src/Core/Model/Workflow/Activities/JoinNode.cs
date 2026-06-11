namespace AppBoxCore;

public sealed class JoinNode : ActivityNode
{
    public override byte Type => ActivityType.JoinActivity;

    public FlowLink Next { get; } = new();

    public override IEnumerable<FlowLink> GetOutLinks()
    {
        yield return Next;
    }
}