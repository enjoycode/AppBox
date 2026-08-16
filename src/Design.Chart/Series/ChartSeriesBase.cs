namespace AppBoxDesign;

public abstract class ChartSeriesBase
{
    /// <summary>
    /// 值表达式
    /// </summary>
    /// <remarks>
    /// 用于报表时 eg: =Fields.成绩字段
    /// </remarks>
    public string Values { get; set; } = string.Empty;

    /// <summary>
    /// 显示名称
    /// </summary>
    /// <remarks>
    /// 如无等于FieldName，eg: "销售额"
    /// </remarks>
    public string? Name { get; set; }

    public bool ShowDataLabels { get; set; }
}