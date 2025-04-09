using System.Diagnostics;
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
        _fields = from.Selects.Select(f => new DataColumn(f.Alias, f.Type)).ToArray();

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

    public SqlDynamicQuery(DynamicQuerySimple from)
    {
        EntityModelId = from.ModelId;
        _fields = from.Selects.Select(f => new DataColumn(f.Alias, f.Type)).ToArray();

        if (from.PageSize > 0)
        {
            TakeSize = from.PageSize;
            SkipSize = from.PageIndex * from.PageSize;
        }

        var ds = new Dictionary<string, EntityExpression> { { "t", new EntityExpression(from.ModelId, null) } };
        Selects = from.Selects.Select(f => new SqlSelectItemExpression(ParseExpression(f.Item, ds)) { Owner = this })
            .ToArray();
        if (from.Orders != null && from.Orders.Any())
            SortItems = from.Orders.Select(o => new SqlOrderBy(ParseExpression(o.Field, ds), o.Descending)).ToArray();

        if (from.Filters != null && from.Filters.Any())
        {
            Expression? filter = null;
            foreach (var item in from.Filters)
            {
                if (item.Value != null)
                {
                    var exp = new BinaryExpression(ParseExpression(item.Field, ds),
                        new ConstantExpression(item.Value), item.Operator);
                    filter = Expression.IsNull(filter)
                        ? exp
                        : new BinaryExpression(filter!, exp, BinaryOperatorType.AndAlso);
                }
            }

            Filter = filter;
        }
    }

    private readonly DataColumn[] _fields;


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

    private static Expression ParseExpression(string exp, Dictionary<string, EntityExpression> ds)
    {
        //考虑使用ExpressionParser实现，现简单实现仅解析EntityPathExpression
        var span = exp.AsSpan();
        EntityPathExpression? expression = null;
        var isFirst = true;
        while (true)
        {
            var index = span.IndexOf('.');
            if (index < 0)
            {
                expression = expression![span.ToString()];
                break;
            }

            var s = span.Slice(0, index);
            if (isFirst)
            {
                isFirst = false;
                expression = ds[s.ToString()];
                Debug.Assert(!Expression.IsNull(expression));
            }
            else
            {
                Debug.Assert(!Expression.IsNull(expression));
                expression = expression![s.ToString()];
            }

            span = span.Slice(index + 1);
        }

        return expression;
    }

    public async Task<DataTable> ToDataTableAsync()
    {
        //TODO:验证是否允许动态查询，并根据规则附加过滤条件
        var model = await RuntimeContext.GetModelAsync<EntityModel>(EntityModelId);
        var db = SqlStore.Get(model.SqlStoreOptions!.StoreModelId);
        await using var cmd = db.BuildQuery(this);
        await using var conn = db.MakeConnection();
        await conn.OpenAsync();
        cmd.Connection = conn;
        Logger.Debug(cmd.CommandText);

        var table = new DataTable(_fields);
        try
        {
            await using var dr = await cmd.ExecuteReaderAsync();
            while (await dr.ReadAsync())
            {
                var row = new DataRow();
                for (var i = 0; i < _fields.Length; i++)
                {
                    row[_fields[i].Name] = _fields[i].Type switch
                    {
                        DataType.String => dr.IsDBNull(i) ? DataCell.Empty : dr.GetString(i),
                        DataType.DateTime => dr.IsDBNull(i)
                            ? DataCell.Empty
                            : dr.GetDateTime(i).ToLocalTime(),
                        DataType.Short => dr.IsDBNull(i) ? DataCell.Empty : dr.GetInt16(i),
                        DataType.Int => dr.IsDBNull(i) ? DataCell.Empty : dr.GetInt32(i),
                        DataType.Long => dr.IsDBNull(i) ? DataCell.Empty : dr.GetInt64(i),
                        DataType.Decimal => dr.IsDBNull(i) ? DataCell.Empty : dr.GetDecimal(i),
                        DataType.Bool => dr.IsDBNull(i) ? DataCell.Empty : dr.GetBoolean(i),
                        DataType.Guid => dr.IsDBNull(i) ? DataCell.Empty : dr.GetGuid(i),
                        DataType.Byte => dr.IsDBNull(i) ? DataCell.Empty : dr.GetByte(i),
                        DataType.Binary => dr.IsDBNull(i) ? DataCell.Empty : (byte[])dr.GetValue(i),
                        DataType.Float => dr.IsDBNull(i) ? DataCell.Empty : dr.GetFloat(i),
                        DataType.Double => dr.IsDBNull(i) ? DataCell.Empty : dr.GetDouble(i),
                        _ => throw new NotImplementedException()
                    };
                }

                row.IsNew = false;
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