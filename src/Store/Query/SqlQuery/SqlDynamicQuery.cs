using AppBoxCore;

namespace AppBoxStore;

/// <summary>
/// 将DynamicQuery转换为ISqlSelectQuery执行查询
/// </summary>
internal sealed class SqlDynamicQuery : SqlSelectQueryBase, ISqlSelectQuery
{
    public SqlDynamicQuery(DynamicQuery from)
    {
        _from = from;
        EntityModelId = from.ModelId;
        _columns = from.Selects.Select(f => new DataColumn(f.Alias, f.Type)).ToArray();

        if (from.PageSize > 0)
        {
            TakeSize = from.PageSize;
            SkipSize = from.PageIndex * from.PageSize;
        }

        Filter = from.Filter;
        //Selects = from.Selects.Select(f => new SqlSelectItemExpression(f.Item) { Owner = this }).ToArray();
        if (from.Orders != null && from.Orders.Any())
            SortItems = from.Orders.Select(o => new SqlOrderBy(o.Field, o.Descending)).ToArray();
    }

    private readonly DataColumn[] _columns;
    private readonly DynamicQuery _from;

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

    private DataRow ReadToDataRow(SqlRowReader rowReader)
    {
        var dr = rowReader.DataReader;
        var row = new DataRow();
        for (var i = 0; i < _columns.Length; i++)
        {
            row[_columns[i].Name] = _columns[i].Type switch
            {
                DataType.String => dr.IsDBNull(i) ? DataCell.Empty : dr.GetString(i),
                DataType.DateTime => dr.IsDBNull(i) ? DataCell.Empty : dr.GetDateTime(i).ToLocalTime(),
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

        return row;
    }

    public async Task<DataTable> ToDataTableAsync()
    {
        //TODO:验证是否允许动态查询，并根据规则附加过滤条件

        var table = new DataTable(_columns);
        table.EntityModelId = EntityModelId;
        await ToListCore(ReadToDataRow, _from.Selects.Select(f => new SqlSelectItemExpression(f.Item) { Owner = this }),
            e =>
            {
                e.AcceptAfterFetch();
                table.Add(e);
            });
        return table;
    }
}