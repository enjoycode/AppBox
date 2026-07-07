using System.Diagnostics;
using AppBoxCore;
using static AppBox.Workflow.WorkflowLogger;

namespace AppBox.Workflow;

public sealed class DecisionActivity : Activity
{
    internal DecisionActivity() { }

    /// <summary>
    /// Only for test
    /// </summary>
    internal DecisionActivity(string title, Expression?[] conditions, Activity?[] links) : base(title)
    {
        _links = new RuntimeFlowLink[links.Length];
        for (var i = 0; i < _links.Length; i++)
        {
            _links[i] = new RuntimeFlowLink
            {
                Condition = conditions[i],
                Target = links[i]
            };
        }
    }

    public override byte Type => ActivityType.DecisionActivity;

    private RuntimeFlowLink[] _links = [];

    internal override void InitActivity(ActivityNode node)
    {
        base.InitActivity(node);

        var decisionNode = (DecisionNode)node;
        _links = new RuntimeFlowLink[decisionNode.Conditions.Count];
    }

    internal override void LinkTo(Activity target, FlowLink link, int linkIndex)
    {
        _links[linkIndex] = new RuntimeFlowLink(link, target);
    }

    internal override async ValueTask<IExecuteResult> Execute(WorkflowInstance instance)
    {
        Logger.Debug($"执行: {Title}");
        var trueAt = -1;
        for (var i = 0; i < _links.Length; i++)
        {
            var condition = _links[i].Condition;
            if (Expression.IsNull(condition))
            {
                trueAt = i;
                break;
            }

            var evaluator = new ExpressionEvaluator(instance);
            var result = await evaluator.Visit(condition!);
            Debug.Assert(result.Type == AnyValue.ValueType.Boolean);
            if (result.GetBool()!.Value)
            {
                trueAt = i;
                break;
            }
        }

        if (trueAt < 0)
            return new ErrorResult("Can't find match condition");

        return new NextResult() { Next = _links[trueAt] };
    }

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);
        ws.SerializeLinkArray(_links);
        ws.WriteFieldEnd(); //保留
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        base.ReadFrom(ref rs);
        _links = rs.DeserializeLinkArray();
        rs.ReadFieldId(); //保留
    }
}