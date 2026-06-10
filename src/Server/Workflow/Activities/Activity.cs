using AppBoxCore;

namespace AppBox.Workflow;

public abstract class Activity : IExecuteResult, IBinSerializable
{
    protected Activity() { }

    protected Activity(string title)
    {
        Title = title;
    }

    public abstract byte Type { get; }
    public string Title { get; private set; } = string.Empty;

    #region ====Init Methods====

    internal virtual void InitActivity(ActivityNode node)
    {
        Title = string.IsNullOrEmpty(node.Title) ? string.Empty : node.Title;
    }

    internal virtual void LinkTo(Activity target, FlowLink link)
    {
        throw new NotSupportedException();
    }

    #endregion

    #region ====Runtime Methods====

    internal virtual ValueTask<IExecuteResult?> Execute(WorkflowInstance instance)
    {
        throw new NotSupportedException();
    }

    internal virtual ValueTask<ResumeResult> Resume(WorkflowInstance instance, IHumanActionResult actionResult)
    {
        throw new NotSupportedException();
    }

    #endregion

    #region ====Serialization====

    public virtual void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteFieldId(1);
        ws.WriteString(Title);

        ws.WriteFieldEnd();
    }

    public virtual void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        do
        {
            var propIndex = rs.ReadFieldId();
            switch (propIndex)
            {
                case 1: Title = rs.ReadString() ?? string.Empty; break;
                case 0: return;
                default: throw SerializationException.ReadUnknownField(nameof(Activity), propIndex);
            }
        } while (true);
    }

    #endregion
}