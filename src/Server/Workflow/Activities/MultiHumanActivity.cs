using System.Diagnostics;
using AppBoxCore;
using static AppBox.Workflow.WorkflowLogger;

namespace AppBox.Workflow;

public sealed class MultiHumanActivity : HumanActivity
{
    internal MultiHumanActivity() { }

    internal MultiHumanActivity(string title, HumanActor[] actors, HumanAction[] actions,
        Expression?[] conditions, Activity?[] links, bool waitAllActor = false)
        : base(title, actors, actions)
    {
        _waitAllActor = waitAllActor;
        _conditions = conditions;
        _links = links;

        foreach (var action in Actions)
            _actionResults.Add(action.Name, 0);
    }

    /// <summary>
    /// 记录当前节点参与人员总数(作为计算结果的条件表达式的参数)
    /// </summary>
    private int _actorCount;

    /// <summary>
    /// 是否必须等待所有参与者处理再判断处理结果，比如用于一票否决的场景
    /// </summary>
    private bool _waitAllActor;

    /// <summary>
    /// 记录每个Action的结果次数(作为计算结果的条件表达式的参数)
    /// </summary>
    private readonly Dictionary<string, int> _actionResults = [];

    /// <summary>
    /// 最后一个条件表达式为null,即所有参与人员处理完后仍旧不满足之前的条件
    /// </summary>
    private Expression?[] _conditions = null!;

    private Activity?[] _links = null!;

    public override byte Type => ActivityType.MultiHumanActivity;

    internal override void InitActivity(ActivityNode node)
    {
        base.InitActivity(node);

        var multiHumanNode = (MultiHumanNode)node;
        _waitAllActor = multiHumanNode.WaitAllActor;
        _conditions = new Expression[multiHumanNode.ResultConditions.Count];
        _links = new Activity[multiHumanNode.ResultConditions.Count];
        for (var i = 0; i < multiHumanNode.ResultConditions.Count; i++)
        {
            _conditions[i] = multiHumanNode.ResultConditions[i].Condition;
        }

        foreach (var action in Actions)
            _actionResults.Add(action.Name, 0);
    }

    internal override void LinkTo(Activity target, FlowLink link, int linkIndex)
    {
        var index = _conditions.IndexOf(((ConditionLink)link).Condition);
        if (index == -1)
            throw new Exception($"Can not find Condition with name: {link.Title}");

        _links[index] = target;
    }

    internal override ValueTask<IExecuteResult?> Execute(WorkflowInstance instance)
    {
        Logger.Debug($"执行: {Title}");
        //1.找到对应的组织单元ID
        var ids = GetOrgUnits();
        _actorCount = ids.Count;

        //2.判断是否一个都没有
        if (ids.Count == 0)
            return new ValueTask<IExecuteResult?>(new Bookmark(BookmarkType.WaitAdmin, Title, []));

        //3.新建Bookmark并返回
        return new ValueTask<IExecuteResult?>(new Bookmark(BookmarkType.WaitActor, Title, ids.ToArray()));
    }

    internal override async ValueTask<ResumeResult> Resume(WorkflowInstance instance, IHumanActionResult actionResult)
    {
        Logger.Debug($"恢复: {Title}");
        if (actionResult is not HumanActionResult humanResult)
            throw new NotImplementedException();

        //找到对应的Action累加计数
        var action = humanResult.Result;
        if (!_actionResults.ContainsKey(action))
            throw new Exception($"Can't find human action: {action}");
        _actionResults[action] += 1;

        var currentActorCount = _actionResults.Values.Sum();
        //先判断是否必须等待所有参与者处理
        if (_waitAllActor && currentActorCount != _actorCount)
            return new ResumeResult() { Suspended = true, CancelOthers = false, Next = null };

        //开始计算条件表达式，注意最后一个必须在所有参与者处理后作为之前条件都不成立
        var trueAt = -1;
        for (var i = 0; i < _conditions.Length; i++)
        {
            var condition = _conditions[i];
            if (Expression.IsNull(condition))
            {
                if (currentActorCount == _actorCount)
                {
                    trueAt = i;
                    break;
                }

                continue;
            }

            var expressionContext = new MultiHumanActivityExpressionContext(instance, this);
            var evaluator = new ExpressionEvaluator(expressionContext);
            var value = await evaluator.Visit(condition!);
            Debug.Assert(value.Type == AnyValue.ValueType.Boolean);
            if (value.GetBool()!.Value)
            {
                trueAt = i;
                break;
            }
        }

        return trueAt < 0
            ? new ResumeResult() { Suspended = true, CancelOthers = false, Next = null }
            : new ResumeResult() { Suspended = false, CancelOthers = true, Next = _links[trueAt] };
    }

    #region ====Serialization====

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);

        //actorCount
        ws.WriteFieldId(1);
        ws.WriteInt(_actorCount);

        //actionResults
        ws.WriteFieldId(2);
        ws.WriteVariant(_actionResults.Count);
        foreach (var kv in _actionResults)
        {
            ws.WriteString(kv.Key);
            ws.WriteInt(kv.Value);
        }

        //links
        ws.WriteFieldId(3);
        ws.WriteVariant(_links.Length);
        for (var i = 0; i < _links.Length; i++)
            ws.SerializeActivity(_links[i]);

        //conditions
        ws.WriteFieldId(4);
        ws.WriteVariant(_conditions.Length);
        for (var i = 0; i < _conditions.Length; i++)
            ws.SerializeExpression(_conditions[i]);

        //waitAllActor
        ws.WriteFieldId(5);
        ws.WriteBool(_waitAllActor);

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
                    _actorCount = rs.ReadInt();
                    break;
                case 2:
                {
                    var count = rs.ReadVariant();
                    for (var i = 0; i < count; i++)
                    {
                        _actionResults.Add(rs.ReadString()!, rs.ReadInt());
                    }

                    break;
                }
                case 3:
                {
                    var count = rs.ReadVariant();
                    _links = new Activity[count];
                    for (var i = 0; i < count; i++)
                    {
                        _links[i] = rs.DeserializeActivity()!;
                    }

                    break;
                }
                case 4:
                {
                    var count = rs.ReadVariant();
                    _conditions = new Expression[count];
                    for (var i = 0; i < count; i++)
                    {
                        _conditions[i] = (Expression?)rs.Deserialize();
                    }

                    break;
                }
                case 5:
                    _waitAllActor = rs.ReadBool();
                    break;
                case 0: return;
                default: throw SerializationException.ReadUnknownField(nameof(SingleHumanActivity), propIndex);
            }
        } while (true);
    }

    #endregion

    private sealed class MultiHumanActivityExpressionContext : IExpressionContext
    {
        public MultiHumanActivityExpressionContext(WorkflowInstance workflowInstance,
            MultiHumanActivity multiHumanActivity)
        {
            _instance = workflowInstance;
            _multiHumanActivity = multiHumanActivity;
        }

        private readonly WorkflowInstance _instance;
        private readonly MultiHumanActivity _multiHumanActivity;

        public AnyValue ResolveParameter(string parameterName) => parameterName switch
        {
            "actorCount" => _multiHumanActivity._actorCount,
            "results" => AnyValue.From(_multiHumanActivity._actionResults),
            _ => _instance.ResolveParameter(parameterName)
        };

        public Type ResolveType(in ExpressionTypeInfo typeInfo) => _instance.ResolveType(typeInfo);
    }
}