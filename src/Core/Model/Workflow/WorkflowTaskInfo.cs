namespace AppBoxCore;

/// <summary>
/// 用于运行时封装工作流任务
/// </summary>
public sealed class WorkflowTaskInfo : IBinSerializable
{
    public Guid InstanceId { get; set; }
    public Guid BookmarkId { get; set; }
    public Guid ActorId { get; set; }
    public int ModelVersion { get; set; }
    public string InstanceTitle { get; set; } = string.Empty;
    public string TaskTitle { get; set; } = string.Empty;
    public string ActorName { get; set; } = string.Empty;
    public string CreatorName { get; set; } = string.Empty;
    public string? FormName { get; set; }

    public WorkflowParameters? Parameters { get; set; }
    public HumanAction[]? Actions { get; set; }
    
    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteGuid(InstanceId);
        ws.WriteGuid(BookmarkId);
        ws.WriteGuid(ActorId);
        ws.WriteInt(ModelVersion);
        ws.WriteString(InstanceTitle);
        ws.WriteString(TaskTitle);
        ws.WriteString(ActorName);
        ws.WriteString(CreatorName);
        ws.WriteString(FormName);
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        InstanceId = rs.ReadGuid();
        BookmarkId = rs.ReadGuid();
        ActorId = rs.ReadGuid();
        ModelVersion = rs.ReadInt();
        InstanceTitle = rs.ReadString()!;
        TaskTitle = rs.ReadString()!;
        ActorName = rs.ReadString()!;
        CreatorName = rs.ReadString()!;
        FormName = rs.ReadString();
    }
}