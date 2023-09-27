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
/// 数据集的配置信息
/// </summary>
public sealed class DataSetSettings : IDynamicDataSetStateValue
{
    /// <summary>
    /// 获取数据集的服务方法 eg: sys.OrderService.GetOrders
    /// </summary>
    public string Service { get; set; } = null!;

    /// <summary>
    /// 服务方法的参数所指向的动态视图的状态的名称
    /// </summary>
    public IList<string>? Arguments { get; set; }

    public void WriteTo(Utf8JsonWriter writer)
    {
        writer.WriteStartObject();

        writer.WriteString(nameof(Service), Service);
        //TODO: arguments

        writer.WriteEndObject();
    }

    public void ReadFrom(ref Utf8JsonReader reader)
    {
        reader.Read(); //{

        reader.Read(); //Service
        reader.Read();
        Service = reader.GetString()!;

        reader.Read(); //}
    }


    #region ====Runtime DataSet====

    private int _fetchFlag = 0;
    private Task<DynamicDataSet?> _fetchTask = null!;

    public async ValueTask<object?> GetRuntimeDataSet()
    {
        if (Interlocked.CompareExchange(ref _fetchFlag, 1, 0) == 0)
        {
            _fetchTask = Channel.Invoke<DynamicDataSet>(Service); //TODO: args
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

    #endregion
}