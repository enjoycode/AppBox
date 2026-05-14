using PixUI;

namespace AppBoxDesign;

internal sealed class WorkflowDesigner : View, IModelDesigner
{
    public WorkflowDesigner(DesignHub designContext, ModelNode modelNode)
    {
        _designContext = designContext;
        ModelNode = modelNode;
    }

    private readonly DesignHub _designContext;
    public ModelNode ModelNode { get; }

    #region ====IModelDesigner====

    public Widget? GetOutlinePad()
    {
        throw new NotImplementedException();
    }

    public Widget? GetToolboxPad()
    {
        throw new NotImplementedException();
    }

    public Task SaveAsync()
    {
        throw new NotImplementedException();
    }

    public Task RefreshAsync()
    {
        throw new NotImplementedException();
    }

    public void GotoLocation(ILocation location)
    {
        throw new NotImplementedException();
    }

    public void OnClose()
    {
        throw new NotImplementedException();
    }

    #endregion
}