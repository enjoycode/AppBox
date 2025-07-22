using AppBox.Reporting;
using PixUI;

namespace AppBoxDesign;

internal readonly struct DiagramPropertyGroup
{
    public string GroupName { get; init; }

    public IDiagramProperty[] Properties { get; init; }
}

internal interface IDiagramProperty
{
    string PropertyName { get; }

    Func<IDiagramProperty, Widget> CreateEditor { get; }

    public Func<object?> ValueGetter { get; init; }

    public Action<object?>? ValueSetter { get; init; }

    bool Readonly { get; }

    /// <summary>
    /// 是否在属性值变更后刷新界面
    /// </summary>
    bool InvalidateAfterChanged { get; }

    void Invalidate();
}

internal sealed class ReportDiagramProperty : IDiagramProperty
{
    public ReportDiagramProperty(IReportItemDesigner obj, string propertyName)
    {
        _obj = obj;
        PropertyName = propertyName;
    }

    private readonly IReportItemDesigner _obj;

    public string PropertyName { get; init; }
    public required Func<IDiagramProperty, Widget> CreateEditor { get; init; }
    public required Func<object?> ValueGetter { get; init; }
    public Action<object?>? ValueSetter { get; init; }
    public bool Readonly => ValueSetter != null;
    public bool InvalidateAfterChanged { get; init; } = true;
    public void Invalidate() => _obj.Invalidate();
}