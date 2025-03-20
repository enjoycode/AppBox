namespace AppBoxCore;

public abstract class EntityPathExpression : Expression
{
    internal EntityPathExpression(string? name, EntityExpression? owner)
    {
        Name = name;
        Owner = owner;
    }

    /// <summary>
    /// 名称
    /// 分以下几种情况：
    /// 1、如果为EntityExpression
    /// 1.1 如果为Root EntityExpression，Name及Owner属性皆为null
    /// 1.2 如果为Ref EntityExpression，Name即属性名称
    /// 2、如果为FieldExpression，Name为属性名称
    /// </summary>
    public string? Name { get; }

    public EntityExpression? Owner { get; }

    public abstract EntityPathExpression this[string name] { get; }

    /// <summary>
    /// eg: Customer.Name => CustomerName
    /// </summary>
    /// <returns></returns>
    internal string GetFieldAlias()
    {
        return IsNull(Owner) ? Name! : $"{Owner!.GetFieldAlias()}{Name}";
    }
}