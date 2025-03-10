using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using AppBoxCore;
using PixUI;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic;

/// <summary>
/// 数据表的配置信息
/// </summary>
public sealed class DynamicTableState : IDynamicTableState
{
    /// <summary>
    /// 获取数据集的服务方法 eg: sys.OrderService.GetOrders
    /// </summary>
    public string Service { get; set; } = string.Empty;

    /// <summary>
    /// 服务方法的参数所指向的动态视图的状态的名称
    /// </summary>
    public string?[] Arguments { get; set; } = Array.Empty<string?>();

    public event Action? DataChanged;

    #region ====Serialization====

    public void WriteTo(Utf8JsonWriter writer)
    {
        writer.WriteStartObject();

        writer.WriteString(nameof(Service), Service);

        if (Arguments.Length > 0)
        {
            writer.WritePropertyName(nameof(Arguments));
            writer.WriteStartArray();
            for (var i = 0; i < Arguments.Length; i++)
            {
                writer.WriteStringValue(Arguments[i]);
            }

            writer.WriteEndArray();
        }

        writer.WriteEndObject();
    }

    public void ReadFrom(ref Utf8JsonReader reader)
    {
        reader.Read(); //{

        reader.Read(); //Service
        reader.Read();
        Service = reader.GetString()!;

        reader.Read(); //Arguments or EndObject
        if (reader.TokenType == JsonTokenType.EndObject)
            return;

        var args = new List<string?>();
        reader.Read(); //[
        while (reader.Read())
        {
            if (reader.TokenType == JsonTokenType.EndArray)
                break;
            args.Add(reader.GetString());
        }

        Arguments = args.ToArray();

        reader.Read(); //}
    }

    #endregion

    #region ====Runtime DataSource====

    private int _fetchFlag;
    private Task<DynamicEntityList?> _fetchTask = null!;

    public async ValueTask<object?> GetRuntimeState(IDynamicContext dynamicContext)
    {
        if (Interlocked.CompareExchange(ref _fetchFlag, 1, 0) == 0)
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

            _fetchTask = Channel.Invoke<DynamicEntityList>(Service, args);
        }

        try
        {
            return await _fetchTask;
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
        Interlocked.Exchange(ref _fetchFlag, 0);
        DataChanged?.Invoke();
    }

    #endregion
}