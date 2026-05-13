using PixUI;
using PixUI.Diagram;

namespace AppBoxDesign;

internal sealed class DependencyDiagramService : IDiagramService
{
    internal DiagramSurface Surface { get; private set; } = null!;

    public void InitSurface(DiagramSurface surface)
    {
        if (Surface != null!)
            throw new Exception("Surface is already set");

        Surface = surface;
    }

    public void MoveSelection(Offset delta)
    {
        //暂不支持移动元素
    }

    public void DeleteSelection() { }
}