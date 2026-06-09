using AppBoxCore;

namespace AppBox.Workflow;

public sealed class Bookmark : IExecuteResult, IBinSerializable
{
    internal Bookmark() { }

    internal Bookmark(BookmarkType type, string title, Guid[] orgUnits)
    {
        Id = SequenceGuid.New();
        Type = type;
        Title = title;
        OrgUnits = orgUnits;
    }

    public Guid Id { get; private set; }

    public BookmarkType Type { get; private set; }

    public string Title { get; private set; } = string.Empty;

    /// <summary>
    /// 执行者的组织单元标识集合，空表示由工作流管理员进行操作
    /// </summary>
    public Guid[] OrgUnits { get; private set; } = [];

    internal void CheckCanResume(Guid ouid)
    {
        if (OrgUnits.Length == 0)
        {
            throw new NotImplementedException(); //TODO:判断ouid是否工作流管理员
        }

        if (!OrgUnits.Contains(ouid))
            throw new Exception("当前用户不能恢复工作流实例");
    }

    #region ====Serialization====

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteGuid(Id);
        ws.WriteByte((byte)Type);
        ws.WriteString(Title);
        ws.WriteVariant(OrgUnits.Length);
        foreach (var orgUnit in OrgUnits)
            ws.WriteGuid(orgUnit);
        ws.WriteFieldEnd();
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        Id = rs.ReadGuid();
        Type = (BookmarkType)rs.ReadByte();
        Title = rs.ReadString() ?? string.Empty;
        var count = rs.ReadVariant();
        OrgUnits = new Guid[count];
        for (var i = 0; i < count; i++)
            OrgUnits[i] = rs.ReadGuid();

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