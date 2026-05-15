using PixUI;
using PixUI.Diagram;

namespace AppBoxDesign;

internal sealed class DiagramToolboxItem : IDiagramToolboxItem
{
    public string Name { get; init; } = null!;

    public IconData Icon { get; init; }

    public Func<DiagramItem> Creator { get; init; } = null!;

    public bool IsConnection { get; init; }

    public DiagramItem Create() => Creator.Invoke();
}