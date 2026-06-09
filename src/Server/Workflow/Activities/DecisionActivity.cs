using AppBoxCore;
using static AppBox.Workflow.WorkflowLogger;

namespace AppBox.Workflow;

public sealed class DecisionActivity : Activity
{
    internal DecisionActivity() { }

    internal DecisionActivity(string title, Expression?[] conditions, Activity?[] links) : base(title)
    {
        _conditions = conditions;
        _links = links;
    }

    public override byte Type => ActivityType.DecisionActivity;

    private Expression?[] _conditions = null!;
    private Activity?[] _links = null!;

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
        Logger.Debug($"执行: {Title}");
        var trueAt = -1;
        for (var i = 0; i < _conditions.Length; i++)
        {
            var condition = _conditions[i];
            if (Expression.IsNull(condition))
            {
                trueAt = i;
                break;
            }

            var evaluator = new ExpressionEvaluator(instance);
            var result = evaluator.Visit(condition!).Result; //TODO:
            if (result.Type != AnyValue.ValueType.Boolean)
                return new ErrorResult("Decision condition return none bool value");
            if (result.GetBool()!.Value)
            {
                trueAt = i;
                break;
            }
        }

        if (trueAt < 0)
            return new ErrorResult("Can't find match condition");

        return _links[trueAt];
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
            ws.SerializeActivity(_links[i]);
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
                        _links[i] = rs.DeserializeActivity();
                    }

                    break;
                }
                case 0: return;
                default: throw SerializationException.ReadUnknownField(nameof(DecisionActivity), propIndex);
            }
        } while (true);
    }
}