using AppBoxCore;

namespace AppBox.Workflow;

public sealed class ForkActivity : Activity
{
    internal ForkActivity() { }

    /// <summary>
    /// Only for test
    /// </summary>
    internal ForkActivity(string title, Activity[] branches) : base(title)
    {
        _branches = new RuntimeFlowLink[branches.Length];
        for (var i = 0; i < _branches.Length; i++)
        {
            _branches[i] = new RuntimeFlowLink(branches[i]);
        }
    }

    public override byte Type => ActivityType.ForkActivity;

    private RuntimeFlowLink[] _branches = null!;

    internal override void InitActivity(ActivityNode node)
    {
        base.InitActivity(node);
        _branches = new RuntimeFlowLink[((ForkNode)node).Branches.Count];
    }

    internal override void LinkTo(Activity target, FlowLink link, int linkIndex)
    {
        _branches[linkIndex] = new(link, target);
    }

    internal override ValueTask<IExecuteResult?> Execute(WorkflowInstance instance)
    {
        return new ValueTask<IExecuteResult?>(
            new ForkResult() { Branches = _branches.Select(t => t.Target!).ToArray() });
    }

    #region ====Serialization====

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);
        ws.WriteArray(_branches);
        ws.WriteFieldEnd(); //保留
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        base.ReadFrom(ref rs);
        _branches = rs.ReadArray<TReader, RuntimeFlowLink>();
        rs.ReadFieldId(); //保留
    }

    #endregion
}