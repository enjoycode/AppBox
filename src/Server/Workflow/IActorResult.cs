using AppBoxCore;

namespace AppBox.Workflow;

/// <summary>
/// 人员操作结果
/// </summary>
public interface IActorResult : IBinSerializable
{
    byte TypeId { get; }

    public static IActorResult Make(byte typeId)
    {
        return typeId switch
        {
            0 => new HumanActionResult(),
            1 => new AssignmentResult(),
            _ => throw new ArgumentOutOfRangeException(nameof(typeId))
        };
    }
}

public sealed class HumanActionResult : IActorResult
{
    internal HumanActionResult() {}
    
    public HumanActionResult(string actorName, string result, string? memo = null)
    {
        ActorName = actorName;
        Result = result;
        Memo = memo;
    }

    public byte TypeId => 0;

    public string ActorName { get; private set; } = string.Empty;

    /// <summary>
    /// 操作结果，比如：同意 or 不同意
    /// </summary>
    public string Result { get; private set; } = string.Empty;

    /// <summary>
    /// 操作备注
    /// </summary>
    public string? Memo { get; private set; }

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteString(ActorName);
        ws.WriteString(Result);
        ws.WriteString(Memo);
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        ActorName = rs.ReadString() ?? string.Empty;
        Result = rs.ReadString() ?? string.Empty;
        Memo = rs.ReadString();
    }
}

/// <summary>
/// 管理员重新指派人员
/// </summary>
public sealed class AssignmentResult : IActorResult
{
    public byte TypeId => 1;

    public Guid[] Assignments { get; init; } = [];

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        throw new NotImplementedException();
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        throw new NotImplementedException();
    }
}