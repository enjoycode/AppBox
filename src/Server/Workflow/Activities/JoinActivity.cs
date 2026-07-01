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
        _next = new RuntimeFlowLink(next);
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

    internal override ValueTask<IExecuteResult?> Execute(WorkflowInstance instance)
    {
        JoinBranchesCount++;
        return new ValueTask<IExecuteResult?>(new JoinResult() { IsAllJoined = IsAllJoined, Next = _next?.Target });
    }

    #region ====Serialization====

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);

        ws.WriteVariant(ForkBranchesCount);
        ws.WriteVariant(JoinBranchesCount);

        ws.WriteBool(_next != null);
        _next?.WriteTo(ref ws);

        ws.WriteFieldEnd(); //保留
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        base.ReadFrom(ref rs);

        ForkBranchesCount = rs.ReadVariant();
        JoinBranchesCount = rs.ReadVariant();

        var hasNext = rs.ReadBool();
        if (hasNext)
        {
            _next = new RuntimeFlowLink();
            _next.ReadFrom(ref rs);
        }

        rs.ReadFieldId(); //保留
    }

    #endregion
}