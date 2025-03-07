using System.Collections.Generic;
using AppBoxCore;

namespace AppBoxStore;

public interface ISqlQuery
{
    /// <summary>
    /// 过滤条件
    /// </summary>
    Expression? Filter { get; }
}

public interface ISqlSelectQuery : ISqlQuery
{
    IList<SqlSelectItemExpression>? Selects { get; }

    IList<SqlOrderBy> SortItems { get; }

    bool HasSortItems { get; }

    int TakeSize { get; }

    int SkipSize { get; }

    /// <summary>
    /// 查询的用途
    /// </summary>
    QueryPurpose Purpose { get; }

    bool Distinct { get; }

    /// <summary>
    /// 分组字段
    /// </summary>
    IList<SqlSelectItemExpression>? GroupByKeys { get; }

    /// <summary>
    /// 分组过滤条件
    /// </summary>
    Expression? HavingFilter { get; }
}

public interface ISqlEntityQuery : ISqlSelectQuery
{
    EntityExpression T { get; }

    string AliasName { get; }
    
    EntityRefModel? TreeParentMember { get; }
}