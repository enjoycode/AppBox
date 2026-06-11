namespace AppBoxCore;

public sealed class JoinNode : ActivityNode
{
    internal JoinNode() { }

    internal JoinNode(string title)
    {
        Title = title;
    }

    public override byte Type => ActivityType.JoinActivity;

    public FlowLink Next { get; } = new();

    public override IEnumerable<FlowLink> GetOutLinks()
    {
        yield return Next;
    }
}