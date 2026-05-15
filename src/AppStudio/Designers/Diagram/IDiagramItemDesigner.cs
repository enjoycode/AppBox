using PixUI.Diagram;

namespace AppBoxDesign.Diagram;

internal interface IDiagramItemDesigner : IDiagramItem, IDiagramItemWithProperties
{
    void Invalidate();
}