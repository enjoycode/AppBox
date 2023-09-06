using System.Collections.Generic;
using System.Text.Json;
using PixUI.Dynamic;

namespace AppBoxDesign;

/// <summary>
/// 数据集的配置信息
/// </summary>
public sealed class DataSetSettings : IDynamicStateValue
{
    /// <summary>
    /// 获取数据集的服务方法 eg: sys.OrderService.GetOrders
    /// </summary>
    public string Service { get; set; }
    
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
}