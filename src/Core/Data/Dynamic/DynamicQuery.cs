namespace AppBoxCore;

public sealed class DynamicQuery
{
    public ModelId ModelId { get; set; }

    public Expression[] Fields { get; set; } = null!;

    public Expression? Filter { get; set; }
}