using AppBoxCore;
using static AppBox.Workflow.WorkflowLogger;

namespace AppBox.Workflow;

public sealed class SingleHumanActivity : HumanActivity
{
    internal SingleHumanActivity() { }

    internal SingleHumanActivity(string title, HumanActor[] actors, HumanAction[] actions, Activity?[] links)
        : base(title, actors, actions)
    {
        _links = links;
    }

    private Activity?[] _links;

    public override byte Type => ActivityType.SingleHumanActivity;

    internal override void InitActivity(ActivityNode node)
    {
        base.InitActivity(node);

        _links = new Activity[Actions.Length];
    }

    internal override void LinkTo(Activity target, FlowLink link)
    {
        var index = FindActionIndex(link.Title);
        if (index == -1)
            throw new Exception($"Can not find Action with name: {link.Title}");

        _links[index] = target;
    }

    internal override ValueTask<IExecuteResult?> Execute(WorkflowInstance instance)
    {
        Logger.Debug($"执行: {Title}");
        //1.找到对应的组织单元ID
        var ids = GetOrgUnits();

        //2.判断是否一个都没有
        if (ids.Count == 0)
            return new ValueTask<IExecuteResult?>( new Bookmark(BookmarkType.WaitAdmin, Title, []));

        //3.新建Bookmark并返回
        return new ValueTask<IExecuteResult?>(new Bookmark(BookmarkType.WaitActor, Title, ids.ToArray()));
    }

    internal override ValueTask<ResumeResult> Resume(WorkflowInstance instance, IHumanActionResult actionResult)
    {
        Logger.Debug($"恢复: {Title}");
        if (actionResult is HumanActionResult humanResult)
        {
            //找到对应的Action
            var index = FindActionIndex(humanResult.Result);
            if (index == -1)
                throw new Exception($"Can't find human action: {humanResult.Result}");
            //直接返回,不保存由调用者处理
            return new ValueTask<ResumeResult>(new ResumeResult() { Suspended = false, CancelOthers = true, Next = _links[index] });
        }
        else
        {
            throw new NotImplementedException();
        }
    }

    #region ====Serialization====

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);

        ws.WriteFieldId(1);
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
                    _links = new Activity[count];
                    for (var i = 0; i < count; i++)
                    {
                        _links[i] = rs.DeserializeActivity()!;
                    }

                    break;
                }
                case 0: return;
                default: throw SerializationException.ReadUnknownField(nameof(SingleHumanActivity), propIndex);
            }
        } while (true);
    }

    #endregion
}