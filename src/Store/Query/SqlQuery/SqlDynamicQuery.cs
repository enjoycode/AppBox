using AppBoxCore;
using static AppBoxStore.StoreLogger;

namespace AppBoxStore;

/// <summary>
/// 将DynamicQuery转换为ISqlSelectQuery执行查询
/// </summary>
internal sealed class SqlDynamicQuery : SqlQueryBase, ISqlSelectQuery
{
    public SqlDynamicQuery(DynamicQuery from)
    {
        EntityModelId = from.ModelId;
        _fields = from.Selects.Select(f => new DynamicFieldInfo(f.Alias, f.Type)).ToArray();

        if (from.PageSize > 0)
        {
            TakeSize = from.PageSize;
            SkipSize = from.PageIndex * from.PageSize;
        }

        Filter = from.Filter;
        Selects = from.Selects.Select(f => new SqlSelectItemExpression(f.Item) { Owner = this }).ToArray();
        if (from.Orders != null && from.Orders.Any())
            SortItems = from.Orders.Select(o => new SqlOrderBy(o.Field, o.Descending)).ToArray();
    }

    private readonly DynamicFieldInfo[] _fields;


    #region ====ISqlSelectQuery Members====

    public ModelId EntityModelId { get; }

    public EntityRefModel? TreeParentMember => throw new NotImplementedException();

    public override EntityPathExpression this[string name] => throw new NotImplementedException();

    public Expression? Filter { get; }
    public IList<SqlSelectItemExpression>? Selects { get; }
    public IList<SqlOrderBy> SortItems { get; } = null!;
    public bool HasSortItems => SortItems != null! && SortItems.Any();
    public int TakeSize { get; }
    public int SkipSize { get; }
    public QueryPurpose Purpose => QueryPurpose.ToList;
    public bool Distinct => false;

    public IList<SqlSelectItemExpression>? GroupByKeys => null;
    public Expression? HavingFilter => null;

    #endregion

    public async Task<DynamicTable> ToTableAsync()
    {
        var model = await RuntimeContext.GetModelAsync<EntityModel>(EntityModelId);
        var db = SqlStore.Get(model.SqlStoreOptions!.StoreModelId);
        await using var cmd = db.BuildQuery(this);
        await using var conn = db.MakeConnection();
        await conn.OpenAsync();
        cmd.Connection = conn;
        Logger.Debug(cmd.CommandText);

        var table = new DynamicTable(_fields);
        try
        {
            await using var dr = await cmd.ExecuteReaderAsync();
            while (await dr.ReadAsync())
            {
                var row = new DynamicRow();
                for (var i = 0; i < _fields.Length; i++)
                {
                    row[_fields[i].Name] = _fields[i].Type switch
                    {
                        DynamicFieldFlag.String => dr.IsDBNull(i) ? DynamicField.Empty : dr.GetString(i),
                        DynamicFieldFlag.DateTime => dr.IsDBNull(i)
                            ? DynamicField.Empty
                            : dr.GetDateTime(i).ToLocalTime(),
                        DynamicFieldFlag.Short => dr.IsDBNull(i) ? DynamicField.Empty : dr.GetInt16(i),
                        DynamicFieldFlag.Int => dr.IsDBNull(i) ? DynamicField.Empty : dr.GetInt32(i),
                        DynamicFieldFlag.Long => dr.IsDBNull(i) ? DynamicField.Empty : dr.GetInt64(i),
                        DynamicFieldFlag.Decimal => dr.IsDBNull(i) ? DynamicField.Empty : dr.GetDecimal(i),
                        DynamicFieldFlag.Bool => dr.IsDBNull(i) ? DynamicField.Empty : dr.GetBoolean(i),
                        DynamicFieldFlag.Guid => dr.IsDBNull(i) ? DynamicField.Empty : dr.GetGuid(i),
                        DynamicFieldFlag.Byte => dr.IsDBNull(i) ? DynamicField.Empty : dr.GetByte(i),
                        DynamicFieldFlag.Binary => dr.IsDBNull(i) ? DynamicField.Empty : (byte[])dr.GetValue(i),
                        DynamicFieldFlag.Float => dr.IsDBNull(i) ? DynamicField.Empty : dr.GetFloat(i),
                        DynamicFieldFlag.Double => dr.IsDBNull(i) ? DynamicField.Empty : dr.GetDouble(i),
                        _ => throw new NotImplementedException()
                    };
                }

                table.Add(row);
            }
        }
        catch (Exception ex)
        {
            Logger.Warn($"Exec sql error: {ex.Message}\n{cmd.CommandText}");
            throw;
        }

        return table;
    }
}