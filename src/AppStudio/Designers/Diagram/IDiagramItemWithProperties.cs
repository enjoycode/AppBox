namespace AppBoxDesign;

internal interface IDiagramItemWithProperties
{
    IEnumerable<DiagramPropertyGroup> GetProperties();
}