namespace AppBoxCore;

/// <summary>
/// 工作流人工节点，定义谁通过哪个用户界面进行什么样的操作，以及操作结果的判定条件
/// </summary>
public abstract class HumanNode : ActivityNode
{
    #region ====Properties====

    /// <summary>
    /// 处理人员
    /// </summary>
    public List<HumanActor> Actors { get; } = [];

    /// <summary>
    /// 用于设置人工处理时所显示的用户表单界面
    /// </summary>
    public ModelId? FormModelId { get; internal set; }

    /// <summary>
    /// 处理人员的动作集合
    /// </summary>
    public List<HumanAction> Actions { get; } = [];

    /// <summary>
    /// 用于判断处理结果的条件分支集合
    /// </summary>
    public List<FlowLink> ResultConditions { get; } = [];

    /// <summary>
    /// 用于调用通知服务提醒相关处理人员
    /// </summary>
    public Expression? Notification { get; set; }

    #endregion

    #region ====Overrides====

    public override IEnumerable<FlowLink> GetOutLinks() => ResultConditions;

    #endregion

    #region ====Serialization====

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);

        ws.WriteCollection(ResultConditions);
        ws.WriteCollection(Actions);
        ws.WriteCollection(Actors);

        ws.WriteBool(FormModelId.HasValue);
        if (FormModelId.HasValue)
            ws.WriteLong(FormModelId.Value);

        ws.WriteFieldEnd();
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        base.ReadFrom(ref rs);

        rs.ReadCollection(ResultConditions);
        rs.ReadCollection(Actions);
        rs.ReadCollection(Actors);

        var hasFormModelId = rs.ReadBool();
        if (hasFormModelId)
            FormModelId = rs.ReadLong();

        rs.ReadFieldId();
    }

    #endregion
}