using AppBoxCore;

namespace AppBox.Workflow;

public interface IExecuteResult { }

internal sealed class ErrorResult : IExecuteResult
{
    public ErrorResult(string error) { }
}

internal sealed class NextResult : IExecuteResult
{
    public RuntimeFlowLink? Next { get; init; }
}

internal sealed class ForkResult : IExecuteResult
{
    public required RuntimeFlowLink[] Branches { get; init; }
}

internal sealed class JoinResult : IExecuteResult
{
    public required bool IsAllJoined { get; init; }
    public RuntimeFlowLink? Next { get; init; }
}

public sealed class Bookmark : IExecuteResult, IBinSerializable
{
    internal Bookmark() { }

    internal Bookmark(BookmarkType type, string title, Guid[] actors)
    {
        Id = SequenceGuid.New();
        Type = type;
        Title = title;
        Actors = actors;
    }

    public Guid Id { get; private set; }

    public BookmarkType Type { get; private set; }

    public string Title { get; private set; } = string.Empty;

    /// <summary>
    /// 执行者的组织单元标识集合，空表示由工作流管理员进行操作
    /// </summary>
    public Guid[] Actors { get; private set; } = [];

    internal void CheckCanResume(Guid actorId)
    {
        if (Actors.Length == 0)
        {
            throw new NotImplementedException(); //TODO:判断ouid是否工作流管理员
        }

        if (!Actors.Contains(actorId))
            throw new Exception("当前用户不能恢复工作流实例");
    }

    #region ====Serialization====

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteGuid(Id);
        ws.WriteByte((byte)Type);
        ws.WriteString(Title);
        ws.WriteVariant(Actors.Length);
        foreach (var actorId in Actors)
            ws.WriteGuid(actorId);
        ws.WriteFieldEnd();
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        Id = rs.ReadGuid();
        Type = (BookmarkType)rs.ReadByte();
        Title = rs.ReadString() ?? string.Empty;
        var count = rs.ReadVariant();
        Actors = new Guid[count];
        for (var i = 0; i < count; i++)
            Actors[i] = rs.ReadGuid();

        rs.ReadFieldId();
    }

    #endregion
}

public enum BookmarkType : byte
{
    /// <summary>
    /// 等待参与者处理
    /// </summary>
    WaitActor,

    /// <summary>
    /// 等待工作流管理员介入
    /// </summary>
    WaitAdmin,
}