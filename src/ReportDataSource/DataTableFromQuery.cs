using System.Text.Json;
using AppBox.Reporting;
using AppBoxCore;
using DeserializeContext = AppBox.Reporting.Serialization.DeserializeContext;

namespace AppBox.ReportDataSource;

public sealed class DataTableFromQuery : ObjectDataSource, IAsyncReportDataSource
{
    private readonly DataTableFromQueryWrap _wrap = new();
    public DataTableFromQueryBase Wrap => _wrap;

    public override void WriteTo(Utf8JsonWriter writer)
    {
        writer.WriteStartObject();
        writer.WriteString(Reporting.Serialization.JsonSerializer.TypeDiscriminator, nameof(DataTableFromQuery));
        writer.WriteString(nameof(Name), Name);
        _wrap.WriteProperties(writer);
        writer.WriteEndObject();
    }

    public override void ReadFrom(ref Utf8JsonReader reader, DeserializeContext context)
    {
        if (!reader.Read() || reader.TokenType != JsonTokenType.PropertyName || reader.GetString() != nameof(Name))
            throw new JsonException("Expected name property.");
        if (!reader.Read() || reader.TokenType != JsonTokenType.String)
            throw new JsonException("Expected string value.");
        Name = reader.GetString() ?? string.Empty;
        _wrap.ReadProperties(ref reader);
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

        throw new NotImplementedException("DataTableFromQuery.FetchDataAsync not implemented");
        // var args = InvokeArgs.Make(q);
        // try
        // {
        //     var result = await RuntimeContext.InvokeAsync("sys.EntityService.Fetch", args);
        //     Console.WriteLine(result);
        // }
        // finally
        // {
        //     args.Free();
        // }
    }

    private sealed class DataTableFromQueryWrap : DataTableFromQueryBase { }
}