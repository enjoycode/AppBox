namespace AppBoxCore;

/// <summary>
/// 人工活动的处理人员，通过表达式计算或指定组织单元
/// </summary>
public sealed class HumanSource : IBinSerializable
{
    /// <summary>
    /// 是否设计时指派的，其余的则为通过表达式计算来的
    /// </summary>
    public bool IsAssigned
    {
        get
        {
            if (Expression.IsNull(OrgUnitExpression))
                return false;
            var exp = OrgUnitExpression as ConstantExpression;
            if (!Expression.IsNull(exp) && exp.Value is Guid)
                return true;
            return false;
        }
    }

    private Expression? _ouExpression;

    /// <summary>
    /// 通过表达式计算来的
    /// </summary>
    /// <remarks>
    /// eg1: 获取部门管理者 sys.Func.GetDeptManagerId(this.Creator.Id)
    /// eg2: 获取公司管理者 sys.Func.GetOrgManagerId(this.Creator.Id)
    /// </remarks>
    public Expression? OrgUnitExpression
    {
        private get => _ouExpression;
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

    public void WriteTo(IOutputStream ws)
    {
        if (!Expression.IsNull(_ouExpression))
        {
            ws.WriteFieldId(1);
            ws.Serialize(_ouExpression);
        }

        ws.WriteFieldEnd();
    }

    public void ReadFrom(IInputStream rs)
    {
        var propIndex = 0;
        do
        {
            propIndex = rs.ReadFieldId();
            switch (propIndex)
            {
                case 1: _ouExpression = (Expression)rs.Deserialize()!; break;
                case 0: break;
                default: throw SerializationException.ReadUnknownField(nameof(HumanSource), propIndex);
            }
        } while (propIndex != 0);
    }

    #endregion
}