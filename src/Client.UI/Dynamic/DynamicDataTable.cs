using System.Text.Json;
using AppBoxClient;
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
    /// 绑定组件当前选择的行
    /// </summary>
    public DataRow? CurrentRow { get; private set; }

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

    public void NotifyStateChanged()
    {
        //TODO: do nothing now
    }

    #region ====Serialization====

    public void WriteTo(Utf8JsonWriter writer)
    {
        writer.WriteStartObject();

        writer.WriteString(nameof(Source), Source.SourceType);
        Source.WriteProperties(writer);

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
        Source.ReadProperties(ref reader);

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

    public void OnCurrentRowChanged(IDataSourceBinder widget, object? dataRow)
    {
        CurrentRow = dataRow as DataRow;
        //通知所有子级状态变更
        if (_childStates == null) return;
        foreach (var childState in _childStates)
        {
            childState.Value?.NotifyStateChanged();
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
        _childStates = null;
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

    void WriteProperties(Utf8JsonWriter writer);

    void ReadProperties(ref Utf8JsonReader reader);
}

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

/// <summary>
/// 来源于服务调用的数据表
/// </summary>
internal sealed class DataTableFromService : DataTableFromServiceBase, IDataTableSource
{
    public string SourceType => DynamicDataTable.FromService;

    public IEnumerable<DataColumn> GetColumns(IDynamicContext context, DynamicDataTable dataTable)
    {
        //暂用以下方式实现，考虑设计时调用一次服务获取DataTable然后保存所有列信息
        var fetchTask = dataTable.GetRuntimeValue(context);
        return fetchTask is { IsCompletedSuccessfully: true, Result: DataTable table } ? table.Columns : [];
    }

    public Task<DataTable?> GetFetchTask(IDynamicContext dynamicContext)
    {
        object?[]? args = null;
        if (Arguments.Length > 0)
        {
            args = new object? [Arguments.Length];
            for (var i = 0; i < args.Length; i++)
            {
                if (!string.IsNullOrEmpty(Arguments[i]))
                    args[i] = dynamicContext.GetPrimitiveState(Arguments[i]!).BoxedValue;
            }
        }

        return Channel.Invoke<DataTable>(Service, args);
    }
}