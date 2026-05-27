namespace AppBoxCore;

/// <summary>
/// 工作流人工节点，定义谁通过哪个用户界面进行什么样的操作，以及操作结果的判定条件
/// </summary>
public abstract class HumanNode : ActivityNode
{
    #region ====Fields====

    private Expression? _formView; // e.View = new erp.Forms.LeaveView
    private Expression? _notificationExpression; //发送通知服务，不设置则不调用

    #endregion

    #region ====Properties====

    public abstract bool IsSingleHuman { get; }

    /// <summary>
    /// 处理人员
    /// </summary>
    public List<HumanSource> HumanSource { get; } = [];

    /// <summary>
    /// 用于设置人工处理时所显示的用户表单界面
    /// </summary>
    public Expression? FormView
    {
        get => _formView;
        set => _formView = value;
    }

    /// <summary>
    /// 处理人员的动作集合
    /// </summary>
    public List<HumanAction> Actions { get; } = [];

    /// <summary>
    /// 用于判断处理结果的条件分支集合
    /// </summary>
    public List<ConditionLink> ResultConditions { get; } = [];

    /// <summary>
    /// 用于调用通知服务提醒相关处理人员
    /// </summary>
    public Expression? Notification
    {
        get => _notificationExpression;
        set => _notificationExpression = value;
    }

    #endregion

    #region ====Overrides====

    public override IEnumerable<FlowLink> GetOutLinks() => ResultConditions;

    #endregion

    #region ====Serialization====

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);

        if (ResultConditions.Count > 0)
        {
            ws.WriteFieldId(1);
            ws.WriteCollection(ResultConditions);
        }

        if (Actions.Count > 0)
        {
            ws.WriteFieldId(2);
            ws.WriteCollection(Actions);
        }

        if (HumanSource.Count > 0)
        {
            ws.WriteFieldId(3);
            ws.WriteCollection(HumanSource);
        }

        if (!Expression.IsNull(_formView))
        {
            ws.WriteFieldId(4);
            ws.SerializeExpression(_formView);
        }

        ws.WriteFieldEnd();
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        base.ReadFrom(ref rs);

        int propIndex;
        do
        {
            propIndex = rs.ReadFieldId();
            switch (propIndex)
            {
                case 1: rs.ReadCollection(ResultConditions); break;
                case 2: rs.ReadCollection(Actions); break;
                case 3: rs.ReadCollection(HumanSource); break;
                case 4: _formView = (Expression)rs.Deserialize()!; break;
                case 0: break;
                default: throw SerializationException.ReadUnknownField(nameof(HumanNode), propIndex);
            }
        } while (propIndex != 0);
    }

    #endregion
}