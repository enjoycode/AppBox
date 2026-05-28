using AppBoxCore;
using AppBoxDesign.Diagram;
using PixUI;

namespace AppBoxDesign.Workflow;

internal sealed class ConditionsEditor : ListEditorBase<ConditionLink>
{
    internal static EditorFactory Factory => (_, prop) =>
        new(new ConditionsEditor(prop), VerticalAlignment.Top);

    public ConditionsEditor(IDiagramProperty propertyItem)
        : base(propertyItem, c => c.Name ?? "[Unnamed]") { }

    private ActivityDesigner ActivityDesigner => (ActivityDesigner)PropertyItem.DiagramItem;

    protected override void OnRemove()
    {
        if (SelectedIndex.Value < 0)
            return;
        var link = DataSources[SelectedIndex.Value];
        //从现有的连接线查找，从画布中移除
        var connections = ActivityDesigner.Surface!.GetConnections().Cast<ActivityConnection>();
        var connection = connections.SingleOrDefault(t => t.Link == link);
        connection?.Remove();
        //删除当前的条件链接
        RemoveSelected();
    }
}