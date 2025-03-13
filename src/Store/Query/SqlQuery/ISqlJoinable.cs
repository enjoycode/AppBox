using AppBoxCore;

namespace AppBoxStore;

public interface ISqlJoinable
{
    bool HasJoins { get; }

    IList<SqlJoin> Joins { get; }

    EntityPathExpression this[string name] { get; }
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