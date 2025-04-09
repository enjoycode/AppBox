using System.Text.Json;
using AppBoxCore;

namespace PixUI.Dynamic;

/// <summary>
/// 数据表的配置信息
/// </summary>
public sealed class DynamicDataTable : IDynamicDataTable
{
    internal const string FromService = "Service";
    internal const string FromQuery = "Query";

    internal IDataTableSource Source { get; set; } = null!;

    public event Action<bool>? DataChanged;

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
            FromQuery => new DataTableFromQuery(),
            FromService => new DataTableFromService(),
            _ => throw new Exception($"Unknown source type: {sourceType}")
        };
        Source.ReadFrom(ref reader);

        //不需要reader.Read(); //}
    }

    #endregion

    #region ====Runtime DataSource====

    private Lazy<Task<DataTable?>>? _fetchTask;

    public async ValueTask<object?> GetRuntimeValue(IDynamicContext dynamicContext)
    {
        Interlocked.CompareExchange(ref _fetchTask,
            new Lazy<Task<DataTable?>>(() => Source.GetFetchTask(dynamicContext)), null);
        try
        {
            return await _fetchTask.Value;
        }
        catch (Exception e)
        {
            Notification.Error("填充数据错误: " + e.Message);
            return null;
        }
    }

    /// <summary>
    /// 清除数据加载状态并通知相关的绑定者刷新数据
    /// </summary>
    public void Refresh()
    {
        Interlocked.Exchange(ref _fetchTask, null);
        DataChanged?.Invoke(false);
    }

    /// <summary>
    /// 改变了数据源配置后重置绑定者(仅设计时)
    /// </summary>
    internal void Reset()
    {
        DataChanged?.Invoke(true);
    }

    #endregion
}

/// <summary>
/// 数据表的来源
/// </summary>
internal interface IDataTableSource
{
    string SourceType { get; }

    Task<DataTable?> GetFetchTask(IDynamicContext dynamicContext);

    void WriteTo(Utf8JsonWriter writer);

    void ReadFrom(ref Utf8JsonReader reader);
}