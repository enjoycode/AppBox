using AppBoxCore;
using static AppBox.Workflow.WorkflowLogger;

namespace AppBox.Workflow;

public sealed class AutomationActivity : Activity
{
    //TODO:重试次数
    private Expression? _expression;
    private Activity? _next;

    internal override void InitActivity(ActivityNode node)
    {
        base.InitActivity(node);

        var automationNode = (AutomationNode)node;
        _expression = automationNode.Expression;
    }

    internal override void LinkTo(Activity target, FlowLink link)
    {
        _next = target;
    }

    internal override IExecuteResult? Execute(WorkflowInstance instance)
    {
        //TODO: 实现执行表达式
        Logger.Debug($"执行工作流Automation: {Title}");

        return _next;
    }

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);

        ws.WriteFieldId(1);
        ws.SerializeExpression(_expression);
        ws.WriteFieldId(2);
        ws.Serialize(_next);

        ws.WriteFieldEnd();
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        base.ReadFrom(ref rs);

        do
        {
            var propIndex = rs.ReadFieldId();
            switch (propIndex)
            {
                case 1: _expression = (Expression?)rs.Deserialize(); break;
                case 2: _next = (Activity?)rs.Deserialize(); break;
                case 0: return;
                default: throw SerializationException.ReadUnknownField(nameof(AutomationActivity), propIndex);
            }
        } while (true);
    }
}