using System.ComponentModel;

namespace AppBoxCore;

/// <summary>
/// 工作流人工节点，定义谁通过哪个用户界面进行什么样的操作，以及操作结果的判定条件
/// </summary>
public abstract class HumanActivityModel : ActivityModel
{
    #region ====Events====

    public event Action<HumanActionsChangingEventArgs>? ActionsChanging;

    #endregion

    #region ====Fields====

    private List<HumanSource> _humanSource = new List<HumanSource>(); // Who
    private Expression _desktopView; // e.View = new erp.Forms.LeaveView
    private List<HumanAction> _actions = new List<HumanAction>(); // "同意","不同意","弃权"
    private Expression _notificationExpression; //发送通知服务，不设置则不调用

    private List<ConditionLink> _resultConditions = new List<ConditionLink>(); //注意：单人活动不设判断条件表达式

    #endregion

    #region ====Properties====

    public abstract bool IsSingleHuman { get; }

    /// <summary>
    /// 处理人员
    /// </summary>
    public List<HumanSource> HumanSource
    {
        get { return _humanSource; }
        set { _humanSource = value; }
    }

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
    public List<HumanAction> Actions
    {
        get { return _actions; }
        set
        {
            var arg = new HumanActionsChangingEventArgs(_actions, value);
            if (ActionsChanging != null)
                ActionsChanging(arg);

            if (!arg.Cancel)
                _actions = value;
        }
    }

    /// <summary>
    /// 用于判断处理结果的条件分支集合
    /// </summary>
    public List<ConditionLink> ResultConditions
    {
        get { return _resultConditions; }
        set { _resultConditions = value; } //todo:检查删除的，从设计器删除对应的Connection
    }

    /// <summary>
    /// 用于调用通知服务提醒相关处理人员
    /// </summary>
    public Expression Notification
    {
        get { return _notificationExpression; }
        set { _notificationExpression = value; }
    }

    #endregion

    #region ====Overrides====

    public override FlowLink[] GetOutLinks()
    {
        return _resultConditions.ToArray();
    }

    #endregion

    #region ====Serialization====

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);

        if (_resultConditions.Count > 0)
        {
            ws.WriteFieldId(1);
            ws.WriteCollection(_resultConditions);
        }

        if (_actions.Count > 0)
        {
            ws.WriteFieldId(2);
            ws.WriteCollection(_actions);
        }

        if (_humanSource.Count > 0)
        {
            ws.WriteFieldId(3);
            ws.WriteCollection(_humanSource);
        }

        if (!Expression.IsNull(_desktopView))
        {
            ws.WriteFieldId(4);
            ws.Serialize(_desktopView);
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
                case 1: rs.ReadCollection(_resultConditions); break;
                case 2: rs.ReadCollection(_actions); break;
                case 3: rs.ReadCollection(_humanSource); break;
                case 4: _desktopView = (Expression)rs.Deserialize()!; break;
                case 0: break;
                default: throw SerializationException.ReadUnknownField(nameof(HumanActivityModel), propIndex);
            }
        } while (propIndex != 0);
    }

    #endregion
}

#region ====HumanActionsChangingEventArgs====

public sealed class HumanActionsChangingEventArgs : CancelEventArgs
{
    public IList<HumanAction> OldActions { get; private set; }
    public IList<HumanAction> NewActions { get; private set; }

    public HumanActionsChangingEventArgs(IList<HumanAction> oldActions, IList<HumanAction> newActions)
    {
        OldActions = oldActions;
        NewActions = newActions;
    }
}

#endregion