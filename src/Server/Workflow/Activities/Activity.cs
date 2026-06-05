using AppBoxCore;

namespace AppBox.Workflow;

public abstract class Activity : IExecuteResult, IBinSerializable
{
    //TODO:加入并行分支的属性

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

    internal virtual IExecuteResult? Execute(WorkflowInstance instance)
    {
        throw new NotSupportedException();
    }

    internal virtual ResumeResult Resume(string bookmarkName, IHumanActionResult result)
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