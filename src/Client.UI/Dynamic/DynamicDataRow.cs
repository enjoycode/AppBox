using System.Text.Json;
using AppBoxCore;

namespace PixUI.Dynamic;

public sealed class DynamicDataRow : IDynamicDataRow
{
    internal const string FromService = "Service";
    internal const string FromQuery = "Query";

    internal IDataRowSource Source { get; set; } = null!;

    public IEnumerable<DynamicState> GetChildStates(DynamicState parent) => Source.GetChildStates(parent);

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
            FromQuery => new DataRowFromQuery(),
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
internal interface IDataRowSource
{
    string SourceType { get; }

    Task<DataTable?> GetFetchTask(IDynamicContext dynamicContext);

    IEnumerable<DynamicState> GetChildStates(DynamicState parent);

    /// <summary>
    /// 转换为数据表，用于传输至后端保存数据
    /// </summary>
    DataTable ToDataTable();

    void WriteTo(Utf8JsonWriter writer);

    void ReadFrom(ref Utf8JsonReader reader);
}