using System;
using System.Collections.Generic;
using System.Text.Json;
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

    private bool _hasFetch = false;
    private object? _fetchedDataSet;

    public async ValueTask<object?> GetRuntimeDataSet()
    {
        if (_hasFetch) return _fetchedDataSet;

        try
        {
            _fetchedDataSet = await Channel.Invoke<DynamicDataSet>(Service); //TODO: args
            _hasFetch = true;
            return _fetchedDataSet;
        }
        catch (Exception e)
        {
            Notification.Error("填充数据集错误: " + e.Message);
            return null;
        }
    }

    #endregion
}