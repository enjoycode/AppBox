using PixUI;
using PixUI.Diagram;

namespace AppBoxDesign.Dependency;

internal sealed class DependencyConnection : DiagramConnection
{
    public DependencyConnection()
    {
        ConnectionType = ConnectionType.Bezier;
        BezierTension = 1;
        TargetCapType = CapType.Arrow2Filled;
        StrokeThickness = 2f;
        ForeColor = new Color(0xFF2196F3);
    }
}