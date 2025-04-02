using PixUI;

namespace AppBoxClient.Dynamic;

/// <summary>
/// 表格列根据条件设置的单元格样式
/// </summary>
public sealed class ConditionalCellStyle
{
    public Comparer Comparer { get; set; }
    public double Comparand { get; set; }
    public Color? TextColor { get; set; }
    public Color? FillColor { get; set; }

    public ConditionalCellStyle Clone() => new()
        { Comparer = Comparer, Comparand = Comparand, TextColor = TextColor, FillColor = FillColor };
}

public enum Comparer
{
    Greater = 0,
    GreaterOrEqual,
    Less,
    LessOrEqual,
    Equal,
    NotEqual,
}