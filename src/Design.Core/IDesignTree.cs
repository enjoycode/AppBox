namespace AppBoxDesign;

public interface IDesignTree
{
    IList<IDesignNode> RootNodes { get; }
}