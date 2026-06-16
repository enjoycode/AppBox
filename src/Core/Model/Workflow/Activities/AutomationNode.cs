namespace AppBoxCore;

/// <summary>
/// 工作流自动节点
/// </summary>
public sealed class AutomationNode : ActivityNode
{
    public AutomationNode()
    {
        Title = "机器活动";
    }

    internal AutomationNode(string title)
    {
        Title = title;
    }

    public override byte Type => ActivityType.AutomationActivity;

    public FlowLink Next { get; } = new();

    public Expression? Expression { get; set; }

    public override IEnumerable<FlowLink> GetOutLinks()
    {
        yield return Next;
    }

    #region ====Serialization====

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);

        ws.SerializeExpression(Expression);
        Next.WriteTo(ref ws);

        ws.WriteFieldEnd();
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        base.ReadFrom(ref rs);

        Expression = (Expression?)rs.Deserialize();
        Next.ReadFrom(ref rs);

        rs.ReadFieldId();
    }

    #endregion
}