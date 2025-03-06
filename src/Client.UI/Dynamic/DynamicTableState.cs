using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using AppBoxClient;
using AppBoxCore;

namespace PixUI.Dynamic;

/// <summary>
/// 数据表的配置信息
/// </summary>
public sealed class DynamicTableState : IDynamicTableState
{
    internal IDynamicTableSource Source { get; set; } = null!;

    public event Action? DataChanged;

    #region ====Serialization====

    public void WriteTo(Utf8JsonWriter writer)
    {
        writer.WriteStartObject();

        writer.WriteString("Source", Source.SourceType);
        Source.WriteTo(writer);

        writer.WriteEndObject();
    }

    public void ReadFrom(ref Utf8JsonReader reader)
    {
        reader.Read(); //{

        reader.Read(); //Source
        reader.Read();
        var sourceType = reader.GetString()!;

        Source = sourceType switch
        {
            "Query" => new DynamicTableFromQuery(),
            "Service" => new DynamicTableFromService(),
            _ => throw new Exception($"Unknown source type: {sourceType}")
        };
        Source.ReadFrom(ref reader);

        reader.Read(); //}
    }

    #endregion

    #region ====Runtime DataSource====

    private Lazy<Task<DynamicEntityList?>>? _fetchTask;

    public async ValueTask<object?> GetRuntimeState(IDynamicContext dynamicContext)
    {
        Interlocked.CompareExchange(ref _fetchTask,
            new Lazy<Task<DynamicEntityList?>>(() => Source.GetFetchTask(dynamicContext)), null);
        try
        {
            return await _fetchTask.Value;
        }
        catch (Exception e)
        {
            Notification.Error("填充数据集错误: " + e.Message);
            return null;
        }
    }

    /// <summary>
    /// 清除数据加载状态并通知相关的绑定者刷新数据
    /// </summary>
    public void Reset()
    {
        Interlocked.Exchange(ref _fetchTask, null);
        DataChanged?.Invoke();
    }

    #endregion
}

internal interface IDynamicTableSource
{
    string SourceType { get; }

    Task<DynamicEntityList?> GetFetchTask(IDynamicContext dynamicContext);

    void WriteTo(Utf8JsonWriter writer);

    void ReadFrom(ref Utf8JsonReader reader);
}

/// <summary>
/// 来源于服务调用
/// </summary>
internal sealed class DynamicTableFromService : IDynamicTableSource
{
    public string SourceType => "Service";

    /// <summary>
    /// 获取数据集的服务方法 eg: sys.OrderService.GetOrders
    /// </summary>
    public string Service { get; set; } = string.Empty;

    /// <summary>
    /// 服务方法的参数所指向的动态视图的状态的名称
    /// </summary>
    public string?[] Arguments { get; set; } = Array.Empty<string?>();

    public Task<DynamicEntityList?> GetFetchTask(IDynamicContext dynamicContext)
    {
        object?[]? args = null;
        if (Arguments.Length > 0)
        {
            args = new object? [Arguments.Length];
            for (var i = 0; i < args.Length; i++)
            {
                if (!string.IsNullOrEmpty(Arguments[i]))
                    args[i] = dynamicContext.GetState(Arguments[i]!).BoxedValue;
            }
        }

        return Channel.Invoke<DynamicEntityList>(Service, args);
    }

    #region ====Serialization====

    public void WriteTo(Utf8JsonWriter writer)
    {
        writer.WriteString(nameof(Service), Service);

        writer.WritePropertyName(nameof(Arguments));
        writer.WriteStartArray();
        for (var i = 0; i < Arguments.Length; i++)
        {
            writer.WriteStringValue(Arguments[i]);
        }

        writer.WriteEndArray();
    }

    public void ReadFrom(ref Utf8JsonReader reader)
    {
        reader.Read(); //Service
        Debug.Assert(reader.GetString() == nameof(Service));
        reader.Read();
        Service = reader.GetString()!;

        reader.Read(); //Arguments
        Debug.Assert(reader.GetString() == nameof(Arguments));
        var args = new List<string?>();
        reader.Read(); //[
        while (reader.Read())
        {
            if (reader.TokenType == JsonTokenType.EndArray)
                break;
            args.Add(reader.GetString());
        }

        Arguments = args.ToArray();
    }

    #endregion
}

/// <summary>
/// 来源于动态查询
/// </summary>
internal sealed class DynamicTableFromQuery : IDynamicTableSource
{
    public string SourceType => "Query";

    /// <summary>
    /// 查询的目标实体模型标识
    /// </summary>
    public ModelId EntityModelId { get; set; }

    /// <summary>
    /// 查询输出的字段
    /// </summary>
    public Expression[] Fields { get; set; } = null!;

    /// <summary>
    /// 过滤条件
    /// </summary>
    public DynamicTableFilter[] Filters { get; set; } = null!;

    public Task<DynamicEntityList?> GetFetchTask(IDynamicContext dynamicContext)
    {
        throw new NotImplementedException();
    }

    #region ====Serialization====

    public void WriteTo(Utf8JsonWriter writer)
    {
        writer.WriteNumber(nameof(EntityModelId), EntityModelId.Value);

        //Fields
        writer.WritePropertyName(nameof(Fields));
        writer.WriteStartArray();
        for (var i = 0; i < Fields.Length; i++)
        {
            ExpressionSerialization.SerializeToJson(writer, Fields[i]);
        }

        writer.WriteEndArray();

        //Filters
        writer.WritePropertyName(nameof(Filters));
        writer.WriteStartArray();
        for (var i = 0; i < Filters.Length; i++)
        {
            Filters[i].WriteTo(writer);
        }

        writer.WriteEndArray();
    }

    public void ReadFrom(ref Utf8JsonReader reader)
    {
        reader.Read(); //EntityModelId
        reader.Read();
        EntityModelId = reader.GetInt64();

        reader.Read(); //Fields
        reader.Read(); //[
        var fields = new List<Expression>();
        while (reader.Read())
        {
            if (reader.TokenType == JsonTokenType.EndArray)
                break;
            fields.Add(ExpressionSerialization.DeserializeFromJson(ref reader)!);
        }

        Fields = fields.ToArray();

        reader.Read(); //Filters
        reader.Read(); //[
        var filters = new List<DynamicTableFilter>();
        while (reader.Read())
        {
            if (reader.TokenType == JsonTokenType.EndArray)
                break;
            filters.Add(DynamicTableFilter.ReadFrom(ref reader));
        }

        Filters = filters.ToArray();
    }

    #endregion
}

internal readonly struct DynamicTableFilter
{
    public DynamicTableFilter(Expression field, BinaryOperatorType operatorType, string state)
    {
        Field = field;
        Operator = operatorType;
        State = state;
    }

    public readonly Expression Field;
    public readonly BinaryOperatorType Operator;
    public readonly string State;

    #region ====Serialization=====

    public void WriteTo(Utf8JsonWriter writer)
    {
        writer.WriteStartObject();
        writer.WritePropertyName(nameof(Field));
        ExpressionSerialization.SerializeToJson(writer, Field);
        writer.WritePropertyName(nameof(Operator));
        writer.WriteStringValue(Operator.ToString());
        writer.WritePropertyName(nameof(State));
        writer.WriteStringValue(State);
        writer.WriteEndObject();
    }

    public static DynamicTableFilter ReadFrom(ref Utf8JsonReader reader)
    {
        reader.Read(); //{

        reader.Read(); //Field
        var field = ExpressionSerialization.DeserializeFromJson(ref reader)!;
        reader.Read(); //Operator
        reader.Read();
        var op = Enum.Parse<BinaryOperatorType>(reader.GetString()!);
        reader.Read(); //State
        reader.Read();
        var state = reader.GetString()!;

        reader.Read(); //}

        return new DynamicTableFilter(field, op, state);
    }

    #endregion
}