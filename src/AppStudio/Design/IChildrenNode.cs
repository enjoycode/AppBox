namespace AppBoxDesign;

/// <summary>
/// 用于组装树
/// </summary>
public interface IChildrenNode
{
    IList<DesignNode> GetChildren();
}