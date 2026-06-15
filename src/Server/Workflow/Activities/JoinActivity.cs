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
        _next = next;
    }

    public override byte Type => ActivityType.JoinActivity;

    private Activity? _next;

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
        _next = target;
    }

    internal override ValueTask<IExecuteResult?> Execute(WorkflowInstance instance)
    {
        JoinBranchesCount++;
        return new ValueTask<IExecuteResult?>(new JoinResult() { IsAllJoined = IsAllJoined, Next = _next });
    }

    #region ====Serialization====

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);

        ws.WriteVariant(ForkBranchesCount);
        ws.WriteVariant(JoinBranchesCount);

        ws.WriteFieldId(1);
        ws.SerializeActivity(_next);

        ws.WriteFieldEnd();
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        base.ReadFrom(ref rs);

        ForkBranchesCount = rs.ReadVariant();
        JoinBranchesCount = rs.ReadVariant();

        do
        {
            var propIndex = rs.ReadFieldId();
            switch (propIndex)
            {
                case 1: _next = rs.DeserializeActivity(); break;
                case 0: return;
                default: throw SerializationException.ReadUnknownField(nameof(JoinActivity), propIndex);
            }
        } while (true);
    }

    #endregion
}