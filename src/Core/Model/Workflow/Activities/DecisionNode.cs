namespace AppBoxCore;

public sealed class DecisionNode : ActivityNode
{
    public DecisionNode() { }

    public override byte Type => ActivityType.DecisionActivity;

    public List<FlowLink> Conditions { get; } = [];

    public override IEnumerable<FlowLink> GetOutLinks() => Conditions;

    #region ====Serialization====

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);

        ws.WriteCollection(Conditions);

        ws.WriteFieldEnd();
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        base.ReadFrom(ref rs);

        rs.ReadCollection(Conditions);

        rs.ReadFieldId();
    }

    #endregion
}