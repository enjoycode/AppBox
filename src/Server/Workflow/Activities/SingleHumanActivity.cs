using System.Diagnostics;
using AppBoxCore;
using static AppBox.Workflow.WorkflowLogger;

namespace AppBox.Workflow;

public sealed class SingleHumanActivity : HumanActivity
{
    internal SingleHumanActivity() { }

    /// <summary>
    /// Only for test
    /// </summary>
    internal SingleHumanActivity(string title, HumanActor[] actors, HumanAction[] actions, Activity?[] links)
        : base(title, actors, actions)
    {
        Debug.Assert(links.Length == actions.Length);

        _links = new RuntimeFlowLink[links.Length];
        for (var i = 0; i < _links.Length; i++)
        {
            _links[i] = new RuntimeFlowLink(links[i]);
        }
    }

    private RuntimeFlowLink[] _links = [];

    public override byte Type => ActivityType.SingleHumanActivity;

    internal override void InitActivity(ActivityNode node)
    {
        base.InitActivity(node);

        _links = new RuntimeFlowLink[Actions.Length];
    }

    internal override void LinkTo(Activity target, FlowLink link, int linkIndex)
    {
        _links[linkIndex] = new RuntimeFlowLink(link, target);
    }

    internal override async ValueTask<IExecuteResult> Execute(WorkflowInstance instance)
    {
        Logger.Debug($"执行: {Title}");
        //1.找到对应的组织单元ID
        var ids = await GetOrgUnits(instance);

        //2.判断是否一个都没有
        if (ids.Count == 0)
            return new Bookmark(BookmarkType.WaitAdmin, Title, [], []);

        //3.新建Bookmark并返回
        return new Bookmark(BookmarkType.WaitActor, Title, ids.ToArray(), Actions);
    }

    internal override ValueTask<ResumeResult> Resume(WorkflowInstance instance, IActorResult actionResult)
    {
        Logger.Debug($"恢复: {Title}");
        if (actionResult is HumanActionResult humanResult)
        {
            //找到对应的Action
            var index = FindActionIndex(humanResult.Result);
            if (index == -1)
                throw new Exception($"Can't find human action: {humanResult.Result}");
            //直接返回,不保存由调用者处理
            return ValueTask.FromResult(new ResumeResult()
                { Suspended = false, CancelOthers = true, Next = _links[index] });
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
        ws.SerializeLinkArray(_links);
        ws.WriteFieldEnd(); //保留
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        base.ReadFrom(ref rs);
        _links = rs.DeserializeLinkArray();
        rs.ReadFieldId(); //保留
    }

    #endregion
}