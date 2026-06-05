using AppBoxCore;
using static AppBox.Workflow.WorkflowLogger;

namespace AppBox.Workflow;

public sealed class DecisionActivity : Activity
{
    private Expression?[] _conditions;
    private Activity?[] _links;

    internal override void InitActivity(ActivityNode node)
    {
        base.InitActivity(node);

        var decisionNode = (DecisionNode)node;
        _conditions = new Expression[decisionNode.Conditions.Count];
        _links = new Activity[decisionNode.Conditions.Count];
        for (var i = 0; i < decisionNode.Conditions.Count; i++)
        {
            _conditions[i] = decisionNode.Conditions[i].Condition;
        }
    }

    internal override void LinkTo(Activity target, FlowLink link)
    {
        var index = _conditions.IndexOf(((ConditionLink)link).Condition);
        if (index == -1)
            throw new Exception($"Can not find Condition with name: {link.Name}");

        _links[index] = target;
    }

    internal override IExecuteResult? Execute(WorkflowInstance instance)
    {
        //todo: 暂简单测试走流程1
        Logger.Debug($"执行工作流Decision: {Title}");
        return _links[0];
    }

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);

        ws.WriteFieldId(1);
        ws.WriteVariant(_conditions.Length);
        for (var i = 0; i < _conditions.Length; i++)
        {
            ws.SerializeExpression(_conditions[i]);
        }

        ws.WriteFieldId(2);
        ws.WriteVariant(_links.Length);
        for (var i = 0; i < _links.Length; i++)
        {
            ws.Serialize(_links[i]);
        }

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
                case 1:
                {
                    var count = rs.ReadVariant();
                    _conditions = new Expression[count];
                    for (var i = 0; i < count; i++)
                    {
                        _conditions[i] = (Expression?)rs.Deserialize();
                    }

                    break;
                }
                case 2:
                {
                    var count = rs.ReadVariant();
                    _links = new Activity[count];
                    for (var i = 0; i < count; i++)
                    {
                        _links[i] = (Activity?)rs.Deserialize();
                    }

                    break;
                }
                case 0: return;
                default: throw SerializationException.ReadUnknownField(nameof(DecisionActivity), propIndex);
            }
        } while (true);
    }
}