namespace AppBoxCore;

public sealed class DecisionActivityModel : ActivityModel
{
    private List<ConditionLink> _conditions = new List<ConditionLink>();

    public List<ConditionLink> Conditions
    {
        get { return _conditions; }
    }

    public DecisionActivityModel()
    {
        //建立默认的两个条件分支
        var cTrue = new ConditionLink();
        cTrue.Name = "是";
        cTrue.Condition = new ConstantExpression(true);
        _conditions.Add(cTrue);
        var cFalse = new ConditionLink();
        cFalse.Name = "否";
        _conditions.Add(cFalse);
    }

    public override FlowLink[]? GetOutLinks()
    {
        return _conditions.ToArray();
    }

    //todo:验证时只允许存在一个Else分支

    #region ====Serialization====

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);

        ws.WriteFieldId(1);
        ws.WriteCollection(_conditions);

        ws.WriteFieldEnd();
    }

    public override void ReadFrom(IInputStream rs)
    {
        base.ReadFrom(rs);

        var propIndex = 0;
        do
        {
            propIndex = rs.ReadFieldId();
            switch (propIndex)
            {
                case 1: rs.ReadCollection(_conditions); break;
                case 0: break;
                default:
                    throw new SerializationException(SerializationError.ReadUnknownFieldId,
                        $"{nameof(DecisionActivityModel)}.{propIndex})");
            }
        } while (propIndex != 0);
    }

    #endregion
}