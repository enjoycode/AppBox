using AppBoxCore;

namespace AppBox.Workflow;

public sealed class StartActivity : Activity
{
    public override byte Type => ActivityType.StartActivity;

    public Activity Next { get; set; } = null!;

    internal override void LinkTo(Activity target, FlowLink link, int linkIndex)
    {
        Next = target;
    }

    internal override ValueTask<IExecuteResult?> Execute(WorkflowInstance instance)
    {
        return new ValueTask<IExecuteResult?>(new NextResult() { Next = Next });
    }

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);
        ws.SerializeActivity(Next);
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        base.ReadFrom(ref rs);
        Next = rs.DeserializeActivity()!;
    }
}