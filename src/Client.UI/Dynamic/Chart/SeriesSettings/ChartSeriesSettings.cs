namespace AppBoxClient.Dynamic;

public abstract class ChartSeriesSettings
{
    /// <summary>
    /// 对应的数据集名称
    /// </summary>
    public string DataSetName { get; set; } = null!;

    /// <summary>
    /// 对应数据集的字段名
    /// </summary>
    public string FieldName { get; set; } = null!;

    /// <summary>
    /// 显示名称，如无等于FieldName，eg: "销售额"
    /// </summary>
    public string? Name { get; set; }
}