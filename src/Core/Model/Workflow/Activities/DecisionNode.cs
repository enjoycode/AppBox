namespace AppBoxCore;

public sealed class DecisionNode : ActivityNode
{
    public DecisionNode() { }

    public override byte Type => ActivityType.DecisionActivity;

    public List<ConditionLink> Conditions { get; } = [];

    public override IEnumerable<FlowLink> GetOutLinks() => Conditions;

    //TODO:验证时只允许存在一个Else分支

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

        var propIndex = 0;
        do
        {
            propIndex = rs.ReadFieldId();
            switch (propIndex)
            {
                case 1: rs.ReadCollection(Conditions); break;
                case 0: break;
                default: throw SerializationException.ReadUnknownField(nameof(DecisionNode), propIndex);
            }
        } while (propIndex != 0);
    }

    #endregion
}