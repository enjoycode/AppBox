using System.Diagnostics;
using AppBoxCore;

namespace AppBox.Workflow;

public sealed class JoinActivity : Activity
{
    internal JoinActivity() { }

    /// <summary>
    /// Only for test
    /// </summary>
    internal JoinActivity(string title, int forkBranchesCount, Activity? next) : base(title)
    {
        Debug.Assert(forkBranchesCount > 0);
        ForkBranchesCount = forkBranchesCount;
        _next = next ==null ? null : new RuntimeFlowLink(next);
    }

    public override byte Type => ActivityType.JoinActivity;

    private RuntimeFlowLink? _next;

    internal int JoinBranchesCount { get; private set; }
    internal int ForkBranchesCount { get; private set; }
    internal bool IsAllJoined => JoinBranchesCount >= ForkBranchesCount;

    internal override void InitActivity(ActivityNode node)
    {
        base.InitActivity(node);

        var joinNode = (JoinNode)node;
        Debug.Assert(joinNode.ForkBranchesCount > 0);
        ForkBranchesCount = joinNode.ForkBranchesCount;
    }

    internal override void LinkTo(Activity target, FlowLink link, int linkIndex)
    {
        _next = new(link, target);
    }

    internal override ValueTask<IExecuteResult> Execute(WorkflowInstance instance)
    {
        JoinBranchesCount++;
        var res = ValueTask.FromResult<IExecuteResult>(new JoinResult() { IsAllJoined = IsAllJoined, Next = _next });
        if (IsAllJoined)
            JoinBranchesCount = 0; //重置因为可能流程重入
        return res;
    }

    #region ====Serialization====

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);

        ws.WriteVariant(ForkBranchesCount);
        ws.WriteVariant(JoinBranchesCount);
        ws.SerializeLink(_next);

        ws.WriteFieldEnd(); //保留
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        base.ReadFrom(ref rs);

        ForkBranchesCount = rs.ReadVariant();
        JoinBranchesCount = rs.ReadVariant();
        _next = rs.DeserializeLink();

        rs.ReadFieldId(); //保留
    }

    #endregion
}