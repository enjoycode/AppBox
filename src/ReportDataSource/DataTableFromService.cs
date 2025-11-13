using System.Text.Json;
using AppBox.Reporting;
using AppBoxCore;
using DeserializeContext = AppBox.Reporting.Serialization.DeserializeContext;

namespace AppBox.ReportDataSource;

public sealed class DataTableFromService : ObjectDataSource, IAsyncReportDataSource
{
    private readonly DataTableFromServiceWrap _wrap = new();

    public DataTableFromServiceBase Wrap => _wrap;

    public override void WriteTo(Utf8JsonWriter writer)
    {
        writer.WriteStartObject();
        writer.WriteString(Reporting.Serialization.JsonSerializer.TypeDiscriminator, nameof(DataTableFromService));
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

    public Task FetchDataAsync()
    {
        throw new NotImplementedException("DataTableFromService.FetchDataAsync is not implemented.");

        // object?[]? args = null;
        // if (Arguments.Length > 0)
        // {
        //     args = new object? [Arguments.Length];
        //     for (var i = 0; i < args.Length; i++)
        //     {
        //         if (!string.IsNullOrEmpty(Arguments[i]))
        //             args[i] = dynamicContext.GetPrimitiveState(Arguments[i]!).BoxedValue;
        //     }
        // }
        //
        // return Channel.Invoke<DataTable>(Service, args);
    }

    private sealed class DataTableFromServiceWrap : DataTableFromServiceBase { }
}