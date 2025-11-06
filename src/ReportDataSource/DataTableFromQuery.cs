using System.Text.Json;
using AppBox.Reporting;
using AppBoxCore;
using DeserializeContext = AppBox.Reporting.Serialization.DeserializeContext;

namespace AppBox.ReportDataSource;

public sealed class DataTableFromQuery : DataTableFromQueryBase, IDataSource
{
    public string Name { get; set; } = string.Empty;

    public void WriteTo(Utf8JsonWriter writer)
    {
        writer.WriteStartObject();
        writer.WriteString(Reporting.Serialization.JsonSerializer.TypeDiscriminator, nameof(DataTableFromQuery));
        writer.WriteString(nameof(Name), Name);
        WriteProperties(writer);
        writer.WriteEndObject();
    }

    public void ReadFrom(ref Utf8JsonReader reader, DeserializeContext context)
    {
        if (!reader.Read() || reader.TokenType != JsonTokenType.PropertyName || reader.GetString() != nameof(Name))
            throw new JsonException("Expected name property.");
        if (!reader.Read() || reader.TokenType != JsonTokenType.String)
            throw new JsonException("Expected string value.");
        Name = reader.GetString() ?? string.Empty;
        ReadProperties(ref reader);
    }
}