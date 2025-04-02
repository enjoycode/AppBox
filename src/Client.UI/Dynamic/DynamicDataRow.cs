using System.Text.Json;
using AppBoxCore;

namespace PixUI.Dynamic;

public sealed class DynamicDataRow : IDynamicDataRow
{
    internal const string FromService = "Service";
    internal const string FromQuery = "Query";

    internal IDynamicRowSource Source { get; set; } = null!;

    public State GetFieldState( /*IDynamicContext dynamicContext,*/ string fieldName)
    {
        throw new NotImplementedException();
    }

    #region ====Serialization====

    public void WriteTo(Utf8JsonWriter writer)
    {
        writer.WriteStartObject();

        writer.WriteString(nameof(Source), Source.SourceType);
        Source.WriteTo(writer);

        writer.WriteEndObject();
    }

    public void ReadFrom(ref Utf8JsonReader reader, DynamicState state)
    {
        reader.Read(); //{

        reader.Read(); //Source
        reader.Read();
        var sourceType = reader.GetString()!;

        Source = sourceType switch
        {
            FromQuery => new DynamicRowFromQuery(),
            // FromService => new DynamicTableFromService(),
            _ => throw new Exception($"Unknown source type: {sourceType}")
        };
        Source.ReadFrom(ref reader);

        //不需要reader.Read(); //}
    }

    #endregion
}

/// <summary>
/// 数据行的来源
/// </summary>
internal interface IDynamicRowSource
{
    string SourceType { get; }

    Task<DynamicRow?> GetFetchTask(IDynamicContext dynamicContext);

    void WriteTo(Utf8JsonWriter writer);

    void ReadFrom(ref Utf8JsonReader reader);
}