using AppBoxCore;

namespace AppBoxStore;

public interface ISqlJoinable : IMemberPathBuilder
{
    bool HasJoins { get; }

    IList<SqlJoin> Joins { get; }
}

public static class ISqlJoinableExtensions
{
    private static ISqlJoinable Join(this ISqlJoinable s, JoinType join, ISqlJoinable target, Expression onCondition)
    {
        if (Equals(null, target) || Equals(null, onCondition))
            throw new ArgumentNullException();

        //TODO: check exists
        s.Joins.Add(new SqlJoin(target, join, onCondition));
        return target;
    }

    public static ISqlJoinable InnerJoin(this ISqlJoinable s, ISqlJoinable target,
        Func<ISqlJoinable, ISqlJoinable, Expression> onCondition)
        => s.Join(JoinType.InnerJoin, target, onCondition(s, target));

    public static ISqlJoinable LeftJoin(this ISqlJoinable s, ISqlJoinable target,
        Func<ISqlJoinable, ISqlJoinable, Expression> onCondition)
        => s.Join(JoinType.LeftJoin, target, onCondition(s, target));

    public static ISqlJoinable RightJoin(this ISqlJoinable s, ISqlJoinable target,
        Func<ISqlJoinable, ISqlJoinable, Expression> onCondition)
        => s.Join(JoinType.RightJoin, target, onCondition(s, target));

    public static ISqlJoinable FullJoin(this ISqlJoinable s, ISqlJoinable target,
        Func<ISqlJoinable, ISqlJoinable, Expression> onCondition)
        => s.Join(JoinType.FullJoin, target, onCondition(s, target));
}

public sealed class SqlJoin //TODO: should be readonly struct
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

public abstract class SqlJoinable : ISqlJoinable //备注曾用名: SqlQueryBase
{
    public string AliasName { get; set; } = null!;

    private List<SqlJoin>? _joins;
    public bool HasJoins => _joins is { Count: > 0 };
    public IList<SqlJoin> Joins => _joins ??= [];

    public abstract EntityFieldExpression F(string name);

    public abstract EntityExpression R(string name, long modelId);

    public abstract EntitySetExpression S(string name, long modelId);

    public abstract Expression U(string name);
}