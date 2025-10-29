using AppBoxClient;
using AppBoxCore;

namespace PixUI.Dynamic;

/// <summary>
/// 来源于动态查询的数据表
/// </summary>
internal sealed class DataTableFromQuery : DataTableFromQueryBase, IDataTableSource
{
    public string SourceType => DynamicDataTable.FromQuery;

    public IEnumerable<DataColumn> GetColumns(IDynamicContext context, DynamicDataTable dataTable) =>
        Selects.Select(item => new DataColumn(item.Alias, item.Type));

    public Task<DataTable?> GetFetchTask(IDynamicContext dynamicContext)
    {
        if (Expression.IsNull(Root))
            throw new Exception("Query target not set");

        var q = new DynamicQuery();
        q.ModelId = Root!.ModelId;
        q.PageIndex = PageIndex;
        q.PageSize = PageSize;
        q.Selects = Selects.ToArray();
        q.Orders = Orders.ToArray();

        foreach (var item in Filters)
        {
            var state = dynamicContext.GetPrimitiveState(item.State);
            if (state.BoxedValue == null || (state.BoxedValue is string s && string.IsNullOrEmpty(s)))
                continue;

            var exp = new BinaryExpression(item.Field, new ConstantExpression(state.BoxedValue), item.Operator);
            q.Filter = Expression.IsNull(q.Filter)
                ? exp
                : new BinaryExpression(q.Filter!, exp, BinaryOperatorType.AndAlso);
        }

        return Channel.Invoke<DataTable>("sys.EntityService.Fetch", [q]);
    }
}