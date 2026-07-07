using AppBoxCore;
using static AppBox.Workflow.WorkflowLogger;

namespace AppBox.Workflow;

public sealed class AutomationActivity : Activity
{
    internal AutomationActivity() { }

    /// <summary>
    /// Only for test
    /// </summary>
    internal AutomationActivity(string title, Expression? expression = null, Activity? next = null) : base(title)
    {
        _expression = expression;
        _next = next == null ? null : new RuntimeFlowLink(next);
    }

    private Expression? _expression;
    private RuntimeFlowLink? _next;

    public override byte Type => ActivityType.AutomationActivity;

    internal override void InitActivity(ActivityNode node)
    {
        base.InitActivity(node);

        var automationNode = (AutomationNode)node;
        _expression = automationNode.Expression;
    }

    internal override void LinkTo(Activity target, FlowLink link, int index)
    {
        _next = new(link, target);
    }

    internal override ValueTask<IExecuteResult> Execute(WorkflowInstance instance)
    {
        //TODO: 实现执行表达式
        Logger.Debug($"执行: {Title}");

        return ValueTask.FromResult<IExecuteResult>(new NextResult() { Next = _next });
    }

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);

        ws.SerializeExpression(_expression);
        ws.SerializeLink(_next);

        ws.WriteFieldEnd(); //保留
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        base.ReadFrom(ref rs);
        _next = rs.DeserializeLink();

        rs.ReadFieldId(); //保留
    }
}