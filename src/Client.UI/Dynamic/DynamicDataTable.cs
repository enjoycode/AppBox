using System.Text.Json;
using AppBoxClient.Dynamic;
using AppBoxCore;
using AppBoxClient.Utils;

namespace PixUI.Dynamic;

/// <summary>
/// 数据表的配置信息
/// </summary>
public sealed class DynamicDataTable : IDynamicDataTable
{
    internal const string FromService = "Service";
    internal const string FromQuery = "Query";

    private List<DynamicState>? _childStates;

    /// <summary>
    /// 数据表的来源，可以是从服务调用或通用数据查询获取
    /// </summary>
    internal IDataTableSource Source { get; set; } = null!;

    /// <summary>
    /// 数据变更事件，用于通知绑定的组件刷新
    /// </summary>
    public event Action<bool>? DataChanged;

    public void CopyFrom(IDynamicContext otherCtx, DynamicState otherState)
    {
        throw new NotImplementedException();
    }

    public IEnumerable<DynamicState> GetChildStates(IDynamicContext context, DynamicState parent)
    {
        if (_childStates == null)
        {
            _childStates = new List<DynamicState>();

            //不使用CurrentRow作为中介
            foreach (var column in Source.GetColumns(context, this))
            {
                var childState = new DynamicState() { Name = $"{parent.Name}.CurrentRow.{column.Name}" };
                childState.AllowNull = true; //始终允许为空
                childState.Type = column.Type.ToDynamicStateType();
                childState.Value = new CurrentRowProxy(this, column.Name);
                _childStates.Add(childState);
            }
        }

        return _childStates;
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

    /// <summary>
    /// 获取所有列信息，主要用于生成子级状态
    /// </summary>
    IEnumerable<DataColumn> GetColumns(IDynamicContext context, DynamicDataTable dataTable);

    /// <summary>
    /// 获取填充数据的任务，eg:执行查询或调用服务
    /// </summary>
    Task<DataTable?> GetFetchTask(IDynamicContext dynamicContext);

    void WriteTo(Utf8JsonWriter writer);

    void ReadFrom(ref Utf8JsonReader reader);
}