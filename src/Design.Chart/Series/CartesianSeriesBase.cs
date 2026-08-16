namespace AppBoxDesign;

public abstract class CartesianSeriesBase : ChartSeriesBase
{
    /// <summary>
    /// 分组字段名
    /// </summary>
    public string GroupBy { get; set; } = string.Empty;

    public bool HasGroup => !string.IsNullOrEmpty(GroupBy);
}