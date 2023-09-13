namespace AppBoxClient.Dynamic;

public sealed class PieSeriesSettings
{
    /// <summary>
    /// 对应的数据集名称
    /// </summary>
    public string DataSet { get; set; } = null!;

    /// <summary>
    /// 对应数据集的值字段 eg: 月销售额
    /// </summary>
    public string Field { get; set; } = null!;

    /// <summary>
    /// 对应数据集的名称字段 eg: 月份
    /// </summary>
    public string? Name { get; set; } = null!;
}