namespace AppBoxCore;

public interface IEntityPathExpression
{
    string? Name { get; }

    EntityExpression? Owner { get; }
}