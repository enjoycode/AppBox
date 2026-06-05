using AppBoxCore;

namespace AppBox.Workflow;

public sealed class Bookmark : IExecuteResult, IBinSerializable
{
    internal Bookmark() { }

    internal Bookmark(Activity activity, string name, Guid[] orgUnits)
    {
        Id = Guid.NewGuid();
        Activity = activity;
        Name = name;
        OrgUnits = orgUnits;
    }

    public Guid Id { get; private set; }

    /// <summary>
    /// 恢复点的名称，不是Activity的标题
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    public Activity Activity { get; private set; } = null!;

    /// <summary>
    /// 执行者的组织单元标识集合，空表示由工作流管理员进行操作
    /// </summary>
    public Guid[] OrgUnits { get; } = [];

    internal ResumeResult Resume(Guid ouid, IHumanActionResult result)
    {
        if (OrgUnits.Length == 0)
        {
            throw new NotImplementedException(); //TODO:判断ouid是否工作流管理员
        }

        if (!OrgUnits.Contains(ouid))
            throw new Exception("当前用户不能恢复工作流实例");

        return Activity.Resume(Name, result);
    }

    #region ====Serialization====

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        throw new NotImplementedException();
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        throw new NotImplementedException();
    }

    #endregion
}