namespace AppBoxDesign;

public interface IDesignNode
{
    string Id { get; }
    DesignNodeType Type { get; }
    string Label { get; }

    IList<IDesignNode>? Children { get; }
}