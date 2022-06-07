using System;
using AppBoxCore;

namespace AppBoxStore;

public struct SqlSortItem
{
    public Expression Expression { get; }

    public SortType SortType { get; }

    public SqlSortItem(Expression sortItem, SortType sortType = SortType.ASC)
    {
        if (Equals(null, sortItem))
            throw new ArgumentNullException(nameof(sortItem));

        if (sortItem.Type != ExpressionType.EntityFieldExpression
            && sortItem.Type != ExpressionType.SelectItemExpression)
            throw new ArgumentException("sortItem is not EntityFieldExpression or SelectItemExpression");

        Expression = sortItem;
        SortType = sortType;
    }
}

public enum SortType : byte //TODO: rename to SortBy
{
    ASC,
    DESC
}