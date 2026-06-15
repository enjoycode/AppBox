using AppBoxCore;

namespace AppBox.Workflow;

public sealed class ForkActivity : Activity
{
    internal ForkActivity() { }

    internal ForkActivity(string title, Activity[] branches) : base(title)
    {
        _branches = branches;
    }

    public override byte Type => ActivityType.ForkActivity;

    private Activity[] _branches = null!;

    internal override void InitActivity(ActivityNode node)
    {
        base.InitActivity(node);
        _branches = new Activity[((ForkNode)node).Branches.Count];
    }

    internal override void LinkTo(Activity target, FlowLink link, int linkIndex)
    {
        _branches[linkIndex] = target;
    }

    internal override ValueTask<IExecuteResult?> Execute(WorkflowInstance instance)
    {
        return new ValueTask<IExecuteResult?>(new ForkResult() { Branches = _branches });
    }

    #region ====Serialization====

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);

        ws.WriteFieldId(1);
        ws.WriteVariant(_branches.Length);
        for (var i = 0; i < _branches.Length; i++)
        {
            ws.SerializeActivity(_branches[i]);
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
                    _branches = new Activity[count];
                    for (var i = 0; i < count; i++)
                    {
                        _branches[i] = rs.DeserializeActivity()!;
                    }

                    break;
                }
                case 0: return;
                default: throw SerializationException.ReadUnknownField(nameof(ForkActivity), propIndex);
            }
        } while (true);
    }

    #endregion
}