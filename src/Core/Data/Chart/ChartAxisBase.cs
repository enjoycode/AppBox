namespace AppBoxDesign;

public abstract class ChartAxisBase
{
    public string? Name { get; set; }

    // public Color? LabelsColor { get; set; }

    /// <summary>
    /// 标签自定义格式化模版(暂保留)
    /// </summary>
    public string? Formatter { get; set; }

    public double MinStep { get; set; } = 0;

    public bool ForceStepToMin { get; set; }

    public double TextSize { get; set; } = 16;
}