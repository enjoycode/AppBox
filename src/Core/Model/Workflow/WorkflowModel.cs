namespace AppBoxCore;

public sealed class WorkflowModel : ModelBase
{
    internal WorkflowModel()
    {
        StartNode = new StartNode();
    }

    public WorkflowModel(ModelId modelId, string name) : base(modelId, name)
    {
        StartNode = new StartNode();
    }

    //TODO:添加默认视图表达式属性

    public StartNode StartNode { get; }

    public List<WorkflowParameter> Parameters { get; } = [];

    /// <summary>
    /// 是否验证为有效的，在引擎执行前如果无效不允许执行
    /// </summary>
    public bool IsValid { get; internal set; }

    #region ====Serialization====

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);

        ws.WriteBool(IsValid);
        StartNode.WriteTo(ref ws);
        ws.WriteCollection(Parameters);

        ws.WriteFieldEnd(); //保留
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        base.ReadFrom(ref rs);

        IsValid = rs.ReadBool();
        StartNode.ReadFrom(ref rs);
        rs.ReadCollection(Parameters);

        rs.ReadFieldId(); //保留
    }

    #endregion
}