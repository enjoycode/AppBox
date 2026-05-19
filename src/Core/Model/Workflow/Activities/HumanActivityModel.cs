namespace AppBoxCore;

/// <summary>
/// 工作流人工节点，定义谁通过哪个用户界面进行什么样的操作，以及操作结果的判定条件
/// </summary>
public abstract class HumanActivityModel : ActivityModel
{

    #region ====Fields====

    private Expression? _desktopView; // e.View = new erp.Forms.LeaveView
    private Expression? _notificationExpression; //发送通知服务，不设置则不调用

    #endregion

    #region ====Properties====

    public abstract bool IsSingleHuman { get; }

    /// <summary>
    /// 处理人员
    /// </summary>
    public List<HumanSource> HumanSource { get; } = [];

    /// <summary>
    /// 用于设置人工处理时所显示的用户界面（桌面或Web）
    /// </summary>
    public Expression DesktopView
    {
        get { return _desktopView; }
        set { _desktopView = value; }
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
        get { return _notificationExpression; }
        set { _notificationExpression = value; }
    }

    #endregion

    #region ====Overrides====

    public override IEnumerable<FlowLink> GetOutLinks() => ResultConditions;

    #endregion

    #region ====Serialization====

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);

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

        if (!Expression.IsNull(_desktopView))
        {
            ws.WriteFieldId(4);
            ws.SerializeExpression(_desktopView);
        }

        ws.WriteFieldEnd();
    }

    public override void ReadFrom(IInputStream rs)
    {
        base.ReadFrom(rs);

        var propIndex = 0;
        do
        {
            propIndex = rs.ReadFieldId();
            switch (propIndex)
            {
                case 1: rs.ReadCollection(ResultConditions); break;
                case 2: rs.ReadCollection(Actions); break;
                case 3: rs.ReadCollection(HumanSource); break;
                case 4: _desktopView = (Expression)rs.Deserialize()!; break;
                case 0: break;
                default: throw SerializationException.ReadUnknownField(nameof(HumanActivityModel), propIndex);
            }
        } while (propIndex != 0);
    }

    #endregion
}