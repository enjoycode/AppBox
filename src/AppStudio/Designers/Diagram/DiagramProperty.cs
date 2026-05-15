namespace AppBoxDesign.Diagram;

internal readonly struct DiagramPropertyGroup
{
    public string GroupName { get; init; }

    public IDiagramProperty[] Properties { get; init; }
}

internal interface IDiagramProperty
{
    IDiagramItemDesigner DiagramItem { get; }
    
    string PropertyName { get; }

    string EditorName { get; }

    object? EditorOptions { get; }

    public Func<object?> ValueGetter { get; init; }

    public Action<object?>? ValueSetter { get; init; }

    bool Readonly { get; }

    /// <summary>
    /// 是否在属性值变更后刷新界面
    /// </summary>
    bool InvalidateAfterChanged { get; }

    void Invalidate();
}

internal interface IDiagramItemWithProperties
{
    IEnumerable<DiagramPropertyGroup> GetProperties();
}

internal sealed class DiagramProperty : IDiagramProperty
{
    public DiagramProperty(IDiagramItemDesigner obj, string propertyName,
        string editorName, object? editorOptions = null)
    {
        DiagramItem = obj;
        PropertyName = propertyName;
        EditorName = editorName;
        EditorOptions = editorOptions;
    }

    public IDiagramItemDesigner DiagramItem { get; }

    public string PropertyName { get; }

    public string EditorName { get; }

    public object? EditorOptions { get; }

    public required Func<object?> ValueGetter { get; init; }
    public Action<object?>? ValueSetter { get; init; }
    public bool Readonly => ValueSetter != null;
    public bool InvalidateAfterChanged { get; init; } = true;
    public void Invalidate() => DiagramItem.Invalidate();
}