namespace AppBoxCore;

public sealed class ForkNode : ActivityNode
{
    internal ForkNode() { }

    internal ForkNode(string title, FlowLink[] branches)
    {
        Title = title;
        Branches.AddRange(branches);
    }

    public override byte Type => ActivityType.ForkActivity;

    /// <summary>
    /// 并行分支
    /// </summary>
    public List<FlowLink> Branches { get; } = [];

    public override IEnumerable<FlowLink> GetOutLinks() => Branches;

    public override IEnumerable<FlowLink> GetAvailableOutLinks()
    {
        if (Branches.All(b => b.DiagramConnection != null))
        {
            //暂用此方式在没有可用并行分支时自动添加一个
            Branches.Add(new FlowLink());
        }

        return Branches.Where(t => t.DiagramConnection == null);
    }

    #region ====Serialization====

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);

        ws.WriteCollection(Branches);

        ws.WriteFieldEnd();
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        base.ReadFrom(ref rs);

        rs.ReadCollection(Branches);

        rs.ReadFieldId();
    }

    #endregion
}