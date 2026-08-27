using AppBox.Reporting;
using AppBoxCore;

namespace AppBox.ReportDataSource;

public sealed class DataTableFromQuery : ObjectDataSource, IAsyncReportDataSource
{
    private readonly DataTableFromQueryWrap _wrap = new();
    public DataTableFromQueryBase Wrap => _wrap;

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        ws.WriteString(Name);
        _wrap.WriteTo(ref ws);
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        Name = rs.ReadString() ?? string.Empty;
        _wrap.ReadFrom(ref rs);
    }

    public async Task FetchDataAsync()
    {
        if (Expression.IsNull(_wrap.Root))
            throw new Exception("Query target not set");

        var q = new DynamicQuery();
        q.ModelId = _wrap.Root!.ModelId;
        q.PageIndex = _wrap.PageIndex;
        q.PageSize = _wrap.PageSize;
        q.Selects = _wrap.Selects.ToArray();
        q.Orders = _wrap.Orders.ToArray();

        //TODO:
        // foreach (var item in _wrap.Filters)
        // {
        //     var state = dynamicContext.GetPrimitiveState(item.State);
        //     if (state.BoxedValue == null || (state.BoxedValue is string s && string.IsNullOrEmpty(s)))
        //         continue;
        //
        //     var exp = new BinaryExpression(item.Field, new ConstantExpression(state.BoxedValue), item.Operator);
        //     q.Filter = Expression.IsNull(q.Filter)
        //         ? exp
        //         : new BinaryExpression(q.Filter!, exp, BinaryOperatorType.AndAlso);
        // }

        var result = await RuntimeContext.Current.InvokeAsync("sys.EntityService.Fetch", AnyArgs.Make(q));
        DataSource = ((DataTable?)result.BoxedValue)?.ToSystemDataTable();
    }

    private sealed class DataTableFromQueryWrap : DataTableFromQueryBase { }
}