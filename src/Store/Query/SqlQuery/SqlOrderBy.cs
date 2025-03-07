using AppBoxCore;

namespace AppBoxStore;

public readonly struct SqlOrderBy
{
    public readonly Expression OrderBy;

    public readonly bool Descending;

    public SqlOrderBy(Expression orderBy, bool descending = false)
    {
        if (Expression.IsNull(orderBy))
            throw new ArgumentNullException(nameof(orderBy));

        if (orderBy.Type != ExpressionType.EntityFieldExpression
            && orderBy.Type != ExpressionType.SelectItemExpression)
            throw new ArgumentException("orderBy is not EntityFieldExpression or SelectItemExpression");

        OrderBy = orderBy;
        Descending = descending;
    }
}