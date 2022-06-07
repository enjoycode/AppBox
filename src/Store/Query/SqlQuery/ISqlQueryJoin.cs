using System;
using System.Collections.Generic;
using AppBoxCore;

namespace AppBoxStore;

public interface ISqlQueryJoin
{
    bool HasJoins { get; }

    IList<SqlJoin> Joins { get; }
}

public static class ISqlQueryJoinExtensions
{
    private static ISqlQueryJoin Join(this ISqlQueryJoin s, JoinType join, ISqlQueryJoin target,
        Expression onCondition)
    {
        if (Equals(null, target) || Equals(null, onCondition))
            throw new ArgumentNullException();

        s.Joins.Add(new SqlJoin(target, join, onCondition));
        return s;
    }

    public static ISqlQueryJoin InnerJoin(this ISqlQueryJoin s, ISqlQueryJoin target,
        Expression onCondition)
        => s.Join(JoinType.InnerJoin, target, onCondition);

    public static ISqlQueryJoin LeftJoin(this ISqlQueryJoin s, ISqlQueryJoin target,
        Expression onCondition)
        => s.Join(JoinType.LeftJoin, target, onCondition);

    public static ISqlQueryJoin RightJoin(this ISqlQueryJoin s, ISqlQueryJoin target,
        Expression onCondition)
        => s.Join(JoinType.RightJoin, target, onCondition);

    public static ISqlQueryJoin FullJoin(this ISqlQueryJoin s, ISqlQueryJoin target,
        Expression onCondition)
        => s.Join(JoinType.FullJoin, target, onCondition);
}