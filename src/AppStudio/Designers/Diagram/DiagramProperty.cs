namespace AppBoxDesign;

internal readonly struct DiagramPropertyGroup
{
    public string GroupName { get; init; }

    public DiagramPropertyItem[] Properties { get; init; }
}

internal sealed class DiagramPropertyItem
{
    public string PropertyName { get; init; } = null!;

    public string EditorName { get; init; } = null!;

    public object? EditorOptions { get; init; }

    public Func<object?> ValueGetter { get; init; } = null!;

    public Action<object?>? ValueSetter { get; init; }

    public bool Readonly => ValueSetter == null;
}