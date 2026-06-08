using AppBoxCore;

namespace AppBox.Workflow;

public sealed class StartActivity : Activity
{
    public Activity Next { get; set; } = null!;

    internal override void LinkTo(Activity target, FlowLink link)
    {
        Next = target;
    }

    internal override IExecuteResult? Execute(WorkflowInstance instance)
    {
        return Next;
    }

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);
        ws.Serialize(Next);
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        base.ReadFrom(ref rs);
        Next = (Activity)rs.Deserialize()!;
    }
}