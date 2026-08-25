using AppBoxCore;

namespace AppBoxDesign;

public abstract class ChartSeriesBase
{
    /// <summary>
    /// 度量(Measure)值表达式
    /// </summary>
    /// <remarks>
    /// 用于报表时 eg: =Fields.成绩字段
    /// </remarks>
    public string Values { get; set; } = string.Empty;

    /// <summary>
    /// 显示名称
    /// </summary>
    public string? Name { get; set; }

    public bool ShowDataLabels { get; set; }

    public bool IsVisibleAtLegend { get; set; } = true;

    /// <summary>
    /// 数据点标签格式化
    /// </summary>
    /// <remarks>
    /// 1.非表达式 eg: "C2"
    /// 2.表达式 eg: =Coordinate.PrimaryValue.ToString("C2")
    /// </remarks>
    public string? DataLabelsFormatter { get; set; }
    
    public virtual void WriteTo<TWriter>(ref TWriter writer) where TWriter : struct, IOutputStream
    {
        
    }
}