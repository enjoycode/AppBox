using PixUI;
using PixUI.Diagram;

namespace AppBoxDesign;

internal sealed class WorkflowToolbox : View, IDiagramToolbox
{
    public IDiagramToolboxItem? SelectedItem { get; }

    public void ClearSelectedItem()
    {
        throw new NotImplementedException();
    }
}

internal sealed class WorkflowToolboxItem : IDiagramToolboxItem
{
    public bool IsConnection { get; }

    public DiagramItem Create()
    {
        throw new NotImplementedException();
    }
}