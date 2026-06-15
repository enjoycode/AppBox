namespace AppBoxCore;

public sealed class DecisionNode : ActivityNode
{
    public DecisionNode() { }

    public override byte Type => ActivityType.DecisionActivity;

    public List<ConditionLink> Conditions { get; } = [];

    public override IEnumerable<FlowLink> GetOutLinks() => Conditions;

    #region ====Serialization====

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);

        ws.WriteFieldId(1);
        ws.WriteCollection(Conditions);

        ws.WriteFieldEnd();
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        base.ReadFrom(ref rs);

        do
        {
            var fieldId = rs.ReadFieldId();
            switch (fieldId)
            {
                case 1: rs.ReadCollection(Conditions); break;
                case 0: return;
                default: throw SerializationException.ReadUnknownField(nameof(DecisionNode), fieldId);
            }
        } while (true);
    }

    #endregion
}