using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

/// <summary>
/// 用于将WorkflowModel转换为相应的画布元素
/// </summary>
internal sealed class WorkflowDesignVisitor
{
    public List<ActivityDesigner> Designers { get; } = [];

    public List<ActivityConnection> Connections { get; } = [];

    public void Visit(ActivityNode? node)
    {
        if (node == null)
            return;

        if (Designers.FindIndex(t => t.Node == node) >= 0)
            return;

        //创建相应的Designer
        var designer = new ActivityDesigner(node);
        designer.Location = new Point(node.X, node.Y);
        Designers.Add(designer);

        //处理连接
        foreach (var link in node.GetOutLinks())
        {
            VisitLink(node, link);
        }
    }

    private void VisitLink(ActivityNode source, FlowLink link)
    {
        if (link.Target != null)
        {
            if (Designers.FindIndex(t => t.Node == link.Target) < 0)
                Visit(link.Target);

            var connectionDesigner = new ActivityConnection(link,
                Designers.Single(t => t.Node == source),
                Designers.Single(t => t.Node == link.Target));
            Connections.Add(connectionDesigner);
        }
    }
}