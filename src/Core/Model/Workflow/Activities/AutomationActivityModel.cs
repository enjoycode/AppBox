namespace AppBoxCore;

/// <summary>
/// 工作流自动节点
/// </summary>
public sealed class AutomationActivityModel : ActivityModel
{
    public AutomationActivityModel()
    {
        Title = "机器活动";
    }

    public override byte Type => ActivityType.AutomationActivity;

    public Expression? Expression { get; set; }

    #region ====Serialization====

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);

        if (!Expression.IsNull(Expression))
        {
            ws.WriteFieldId(1);
            ws.Serialize(Expression);
        }

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
                case 1: Expression = (Expression)rs.Deserialize()!; break;
                case 0: break;
                default: throw SerializationException.ReadUnknownField(nameof(AutomationActivityModel), propIndex);
            }
        } while (propIndex != 0);
    }

    #endregion
}