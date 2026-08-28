namespace AppBoxCore;

/// <summary>
/// 来源于服务调用的数据表
/// </summary>
public abstract class DataTableFromServiceBase
{
    /// <summary>
    /// 获取数据集的服务方法 eg: sys.OrderService.GetOrders
    /// </summary>
    public string Service { get; set; } = string.Empty;

    /// <summary>
    /// 服务方法的参数所指向的动态视图的状态的名称
    /// </summary>
    public string?[] Arguments { get; set; } = [];

    #region ====Serialization====

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteString(Service);
        ws.WriteVariant(Arguments.Length);
        foreach (var arg in Arguments)
        {
            ws.WriteString(arg);
        }
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        Service = rs.ReadString() ?? string.Empty;
        var count = rs.ReadVariant();
        Arguments = new string?[count];
        for (var i = 0; i < count; i++)
        {
            Arguments[i] = rs.ReadString();
        }
    }

    #endregion
}