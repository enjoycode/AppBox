using AppBoxCore;
using static AppBoxStore.StoreLogger;

namespace AppBoxStore;

/// <summary>
/// 将DynamicQuery转换为ISqlSelectQuery执行查询
/// </summary>
internal sealed class SqlDynamicQuery : SqlSelectQueryBase, ISqlSelectQuery
{
    public SqlDynamicQuery(DynamicQuery from)
    {
        Purpose = QueryPurpose.ToList;
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

    private readonly DataColumn[] _fields;

    #region ====IMemberPathBuilder====

    public override EntityFieldExpression F(string name) => throw new NotSupportedException();
    public override EntityExpression R(string name, long modelId) => throw new NotSupportedException();
    public override EntitySetExpression S(string name, long modelId) => throw new NotSupportedException();
    public override Expression U(string name) => throw new NotSupportedException();

    #endregion

    #region ====ISqlSelectQuery Members====

    public ModelId EntityModelId { get; }

    public EntityRefMember? TreeParentMember => throw new NotImplementedException();

    #endregion

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
        table.EntityModelId = EntityModelId;
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

                row.AcceptAfterFetch();
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