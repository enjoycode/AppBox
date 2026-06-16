namespace AppBoxCore;

/// <summary>
/// 人工活动的处理人员，通过表达式计算或指定组织单元
/// </summary>
public sealed class HumanActor : IBinSerializable
{
    public HumanActor() { }

    public HumanActor(Expression? ouExpression)
    {
        _ouExpression = ouExpression;
    }

    /// <summary>
    /// 是否设计时指派的，其余的则为通过表达式计算来的
    /// </summary>
    public bool IsAssigned
    {
        get
        {
            if (Expression.IsNull(OrgUnitExpression))
                return false;
            return OrgUnitExpression is ConstantExpression { Value.Type: AnyValue.ValueType.Guid };
        }
    }

    private Expression? _ouExpression;

    /// <summary>
    /// 工作流参与者表达式
    /// </summary>
    /// <remarks>
    /// eg1: 获取部门管理者 sys.Func.GetDeptManagerId(this.Creator.Id)
    /// eg2: 获取公司管理者 sys.Func.GetOrgManagerId(this.Creator.Id)
    /// eg3: 从工作流实例的参数获取  this.专家列表 or this.评审表实体.专家列表
    /// </remarks>
    public Expression? OrgUnitExpression
    {
        get => _ouExpression;
        set
        {
            _ouExpression = value;
            _cachedOrgUnitPath = null;
        }
    }

    /// <summary>
    /// 仅用于设计时显示
    /// </summary>
    public string DisplayText
    {
        get
        {
            if (AssignedOrgUnit != null)
                return AssignedOrgUnit.ToString();
            else
                return Expression.IsNull(OrgUnitExpression) ? "" : OrgUnitExpression!.ToString();
        }
    }

    private TreePath? _cachedOrgUnitPath;

    /// <summary>
    /// 仅用于设计时简化指配
    /// </summary>
    public TreePath? AssignedOrgUnit
    {
        get
        {
            if (IsAssigned)
            {
                if (_cachedOrgUnitPath == null)
                {
                    throw new NotImplementedException();
                    // var id = (Guid)((ConstantExpression)_ouExpression).Value!;
                    // var ctx = RuntimeContext.Default;
                    // _cachedOrgUnitPath =
                    //     (TreePath)ctx.Invoke("sys.DesignService.GetOrgUnitPath", new InvokeArgs().Add(id));
                }

                return _cachedOrgUnitPath;
            }

            return null;
        }
        set
        {
            _cachedOrgUnitPath = value;
            _ouExpression = Expression.Constant(_cachedOrgUnitPath![0].Id);
        }
    }

    #region ====Serialization====

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.SerializeExpression(_ouExpression);
        ws.WriteFieldEnd();
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        _ouExpression = (Expression?)rs.Deserialize();
        rs.ReadFieldId();
    }

    #endregion
}