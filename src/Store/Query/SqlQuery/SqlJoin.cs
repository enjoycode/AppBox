using AppBoxCore;

namespace AppBoxStore;

public sealed class SqlJoin
{
    public SqlJoin(ISqlJoinable right, JoinType joinType, Expression onCondition)
    {
        Right = right;
        JoinType = joinType;
        OnCondition = onCondition;
    }

    public ISqlJoinable Right { get; }

    public Expression OnCondition { get; }

    public JoinType JoinType { get; }
}

/// <summary>
/// 查询联接类型
/// </summary>
/// <remarks>对应数据库查询的联接类型</remarks>
public enum JoinType : byte
{
    InnerJoin,
    LeftJoin,
    RightJoin,
    FullJoin
}