using AppBoxCore;

namespace AppBox.Workflow;

public sealed class StartActivity : Activity
{
    public override byte Type => ActivityType.StartActivity;

    public RuntimeFlowLink Next { get; set; } = null!;

    internal override void LinkTo(Activity target, FlowLink link, int linkIndex)
    {
        Next = new RuntimeFlowLink(link, target);
    }

    internal override ValueTask<IExecuteResult?> Execute(WorkflowInstance instance)
    {
        return ValueTask.FromResult<IExecuteResult?>(new NextResult() { Next = Next.Target });
    }

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);
        Next.WriteTo(ref ws);
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        base.ReadFrom(ref rs);
        Next = new RuntimeFlowLink();
        Next.ReadFrom(ref rs);
    }
}