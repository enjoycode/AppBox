using AppBoxCore;
using AppBoxDesign.Diagram;
using PixUI;

namespace AppBoxDesign;

/// <summary>
/// 仅用于包装WorkflowModel在属性面板显示相关属性
/// </summary>
internal sealed class WorkflowRootDesigner : IDiagramItemDesigner
{
    public WorkflowRootDesigner(WorkflowModel model)
    {
        _model = model;
    }

    private readonly WorkflowModel _model;
    public string TypeName => "Workflow";
    public bool IsSelected => false;
    public Point Location { get; set; } = Point.Empty;
    public Rect Bounds => Rect.Empty;

    public void Invalidate() { }

    public IEnumerable<DiagramPropertyGroup> GetProperties()
    {
        var nameProperty = new DiagramProperty(this, "Name", TextEditor.Factory)
        {
            ValueGetter = () => _model.Name,
        };

        yield return new DiagramPropertyGroup() { GroupName = "Properties", Properties = [nameProperty] };
    }
}