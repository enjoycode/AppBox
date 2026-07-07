using AppBoxCore;

namespace AppBox.Workflow;

public abstract class Activity : IBinSerializable
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

    internal virtual void LinkTo(Activity target, FlowLink link, int linkIndex)
    {
        throw new NotSupportedException();
    }

    #endregion

    #region ====Runtime Methods====

    internal virtual ValueTask<IExecuteResult> Execute(WorkflowInstance instance)
    {
        throw new NotSupportedException();
    }

    internal virtual ValueTask<ResumeResult> Resume(WorkflowInstance instance, IActorResult actionResult)
    {
        throw new NotSupportedException();
    }

    #endregion

    #region ====Serialization====

    public virtual void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteString(Title);
        ws.WriteFieldEnd(); //保留
    }

    public virtual void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        Title = rs.ReadString() ?? string.Empty;
        rs.ReadFieldId(); //保留
    }

    #endregion
}