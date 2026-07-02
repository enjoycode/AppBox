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
        Debug.Assert(conditions.Length == links.Length);

        _waitAllActor = waitAllActor;
        _links = new RuntimeFlowLink[conditions.Length];
        for (var i = 0; i < _links.Length; i++)
        {
            _links[i] = new RuntimeFlowLink(links[i], conditions[i]);
        }

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
    private RuntimeFlowLink[] _links = [];

    public override byte Type => ActivityType.MultiHumanActivity;

    internal override void InitActivity(ActivityNode node)
    {
        base.InitActivity(node);

        var multiHumanNode = (MultiHumanNode)node;
        _waitAllActor = multiHumanNode.WaitAllActor;
        _links = new RuntimeFlowLink[multiHumanNode.ResultConditions.Count];

        foreach (var action in Actions)
            _actionResults.Add(action.Name, 0);
    }

    internal override void LinkTo(Activity target, FlowLink link, int linkIndex)
    {
        _links[linkIndex] = new RuntimeFlowLink(link, target);
    }

    internal override async ValueTask<IExecuteResult?> Execute(WorkflowInstance instance)
    {
        Logger.Debug($"执行: {Title}");
        //1.找到对应的组织单元ID
        var ids = await GetOrgUnits(instance);
        _actorCount = ids.Count;

        //2.判断是否一个都没有
        if (ids.Count == 0)
            return new Bookmark(BookmarkType.WaitAdmin, Title, []);

        //3.新建Bookmark并返回
        return new Bookmark(BookmarkType.WaitActor, Title, ids.ToArray());
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
        for (var i = 0; i < _links.Length; i++)
        {
            var condition = _links[i].Condition;
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
            : new ResumeResult() { Suspended = false, CancelOthers = true, Next = _links[trueAt].Target };
    }

    #region ====Serialization====

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);

        ws.WriteBool(_waitAllActor);
        ws.WriteInt(_actorCount);
        ws.WriteArray(_links);

        foreach (var kv in _actionResults)
        {
            ws.WriteString(kv.Key);
            ws.WriteInt(kv.Value);
        }

        ws.WriteFieldEnd(); //保留
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        base.ReadFrom(ref rs);

        _waitAllActor = rs.ReadBool();
        _actorCount = rs.ReadInt();
        _links = rs.ReadArray<TReader, RuntimeFlowLink>();

        for (var i = 0; i < Actions.Length; i++)
        {
            _actionResults.Add(rs.ReadString()!, rs.ReadInt());
        }

        rs.ReadFieldId(); //保留
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