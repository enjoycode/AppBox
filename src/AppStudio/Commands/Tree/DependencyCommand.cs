using PixUI;

namespace AppBoxDesign;

internal sealed class DependencyCommand : DesignCommand
{
    public DependencyCommand(DesignHub context) : base(context) { }

    private DependencyNode? _dependencyNode;

    public void Execute()
    {
        try
        {
            var designer = DesignStore.ActiveDesigner;
            if (designer == null) return;

            if (designer is not IModelDesigner modelDesigner)
                return;

            _dependencyNode ??= new DependencyNode();
            DesignStore.OpenOrActiveDesigner(_dependencyNode, null);
            ((DependencyDesigner)_dependencyNode.Designer!).SetTargetModelNode(modelDesigner.ModelNode);
        }
        catch (Exception ex)
        {
            Notification.Error($"Open dependency error: {ex.Message}");
        }
    }
}