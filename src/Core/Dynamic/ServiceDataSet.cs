namespace AppBoxCore;

/// <summary>
/// 通过调用服务获取的数据集
/// </summary>
public sealed class ServiceDataSet : IDataSet
{
    /// <summary>
    /// 服务方法 eg: app.SalesService.GetAllOrders
    /// </summary>
    public string ServicePath { get; set; }
}