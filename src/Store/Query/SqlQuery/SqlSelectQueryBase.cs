using AppBoxCore;

namespace AppBoxStore;

public abstract class SqlSelectQueryBase : SqlJoinable
{
    private List<SqlSelectItemExpression>? _selects;
    private List<SqlOrderBy>? _sortItems;

    public QueryPurpose Purpose { get; protected set; }
    public Expression? Filter { get; protected set; }

    public IList<SqlSelectItemExpression> Selects
    {
        get => _selects ??= [];
        protected set => _selects = value.ToList();
    }

    public IList<SqlOrderBy> SortItems
    {
        get => _sortItems ??= [];
        protected set => _sortItems = value.ToList();
    }

    public bool HasSortItems => _sortItems is { Count: > 0 };
    public int TakeSize { get; protected set; }
    public int SkipSize { get; protected set; }
    public bool Distinct { get; protected set; }
    public IList<SqlSelectItemExpression>? GroupByKeys { get; protected set; }
    public Expression? HavingFilter { get; protected set; }

    protected void ClearSelects() => _selects?.Clear();

    protected bool HasSelects() => _selects is { Count: > 0 };
}