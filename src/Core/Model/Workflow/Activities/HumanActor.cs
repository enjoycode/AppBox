namespace AppBoxCore;

/// <summary>
/// 人工活动的处理人员，通过表达式计算或指定组织单元
/// </summary>
public sealed class HumanActor : IBinSerializable
{
    public HumanActor() { }

    public HumanActor(Expression? ouExpression)
    {
        OrgUnitExpression = ouExpression;
    }

    /// <summary>
    /// 参与者来源
    /// </summary>
    public ActorSource Source
    {
        get
        {
            if (Expression.IsNull(OrgUnitExpression))
                return ActorSource.FromExpression;

            if (OrgUnitExpression is ConstantExpression constantExpression)
            {
                if (constantExpression.Value.Type == AnyValue.ValueType.Guid)
                    return ActorSource.FromAssigned;
                if (constantExpression.Value.Type == AnyValue.ValueType.Object)
                    return ActorSource.FromWorkflowActorService;
            }

            return ActorSource.FromExpression;
        }
    }

    public Guid AssignedOrgUnitId
    {
        get
        {
            if (OrgUnitExpression is ConstantExpression { Value.Type: AnyValue.ValueType.Guid } constantExpression)
                return constantExpression.Value.GetGuid()!.Value;
            throw new InvalidOperationException();
        }
    }

    public string ActorServiceMethodName
    {
        get
        {
            if (OrgUnitExpression is ConstantExpression { Value.Type: AnyValue.ValueType.Object } constantExpression)
                return constantExpression.Value.BoxedValue!.ToString()!;
            throw new InvalidOperationException();
        }
    }

    /// <summary>
    /// 工作流参与者表达式
    /// </summary>
    /// <remarks>
    /// eg1: 指定的                     ConstantExpression(Guid值)
    /// eg2: 从WorkflowActorService获取 ConstantExpression("GetManager")
    /// eg3: 其他表达式, eg: 从工作流实例的参数获取  this.专家列表 or this.评审表实体.专家列表
    /// </remarks>
    public Expression? OrgUnitExpression { get; internal set; }

    /// <summary>
    /// 仅用于设计时显示
    /// </summary>
    public string DisplayName { get; internal set; } = string.Empty;

    #region ====Serialization====

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.SerializeExpression(OrgUnitExpression);
        ws.WriteFieldEnd();
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        OrgUnitExpression = (Expression?)rs.Deserialize();
        rs.ReadFieldId();
    }

    #endregion

    public enum ActorSource : byte
    {
        /// <summary>
        /// 指定的
        /// </summary>
        FromAssigned,

        /// <summary>
        /// 调用WorkflowActorService获取
        /// </summary>
        FromWorkflowActorService,

        /// <summary>
        /// 其他表达式计算获取
        /// </summary>
        FromExpression
    }
}