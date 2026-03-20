using AppBoxCore;
using static AppBoxStore.StoreLogger;

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

    protected bool HasSelects() => _selects is { Count: > 0 };

    protected async Task ToListCore<TResult>(Func<SqlRowReader, TResult> selector,
        IEnumerable<Expression> selects, Action<TResult> addItem)
    {
        //if (SkipSize > -1 && !HasSortItems)
        //    throw new ArgumentException("Paged query must has sort items."); //TODO:加入默认主键排序

        var query = (ISqlSelectQuery)this;
        Purpose = QueryPurpose.ToList;

        _selects?.Clear();
        foreach (var item in selects)
        {
            query.AddSelectItem(new SqlSelectItemExpression(item));
        }

        if (!HasSelects())
            throw new ArgumentException("must select some one");

        //递交查询
        var model = await RuntimeContext.GetModelAsync<EntityModel>(query.EntityModelId);
        var db = SqlStore.Get(model.SqlStoreOptions!.StoreModelId); //TODO: should be query.GetSqlStore()?
        await using var cmd = db.BuildQuery(query);
        await using var conn = db.MakeConnection();
        await conn.OpenAsync();
        cmd.Connection = conn;
        Logger.Debug(cmd.CommandText);

        try
        {
            await using var reader = await cmd.ExecuteReaderAsync();
            var rr = new SqlRowReader(reader);
            while (await reader.ReadAsync())
            {
                addItem(selector(rr));
            }
        }
        catch (Exception ex)
        {
            Logger.Warn($"Exec sql error: {ex.Message}\n{cmd.CommandText}");
            throw;
        }
    }
}