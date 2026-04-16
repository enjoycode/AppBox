using PixUI;

namespace AppBoxDesign;

/// <summary>
/// 特殊类型的设计节点
/// </summary>
internal sealed class DependencyNode : DesignNode
{
    public override DesignNodeType Type => DesignNodeType.ApplicationRoot; //暂使用ApplicationRoot
    public override State<string> Label { get; } = "Dependency";
}