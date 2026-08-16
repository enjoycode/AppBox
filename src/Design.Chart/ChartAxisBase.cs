namespace AppBoxDesign;

public abstract class ChartAxisBase
{
    public string? Name { get; set; }

    /// <summary>
    /// 数据集的标签表达式
    /// </summary>
    /// <remarks>
    /// 用于报表时 eg: =Fields.姓名
    /// 可以设置为空
    /// </remarks>
    public string? Labels { get; set; }

    public bool HasLabels => !string.IsNullOrEmpty(Labels);

    // public Color? LabelsColor { get; set; }

    /// <summary>
    /// 标签自定义格式化模版(暂保留)
    /// </summary>
    public string? Formatter { get; set; }

    public double MinStep { get; set; } = 0;

    public bool ForceStepToMin { get; set; }

    public double TextSize { get; set; } = 16;
}