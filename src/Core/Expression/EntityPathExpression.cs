namespace AppBoxCore;

public abstract class EntityPathExpression : Expression
{
    /// <summary>
    /// 名称
    /// 分以下几种情况：
    /// 1、如果为EntityExpression
    /// 1.1 如果为Root EntityExpression，Name及Owner属性皆为null
    /// 1.2 如果为Ref EntityExpression，Name即属性名称
    /// 2、如果为FieldExpression，Name为属性名称
    /// </summary>
    public string? Name { get; internal set; }

    public EntityExpression? Owner { get; private set; }

    public abstract EntityPathExpression this[string name] { get; }

    /// <summary>
    /// Ctor for Serialization
    /// </summary>
    internal EntityPathExpression() { }

    internal EntityPathExpression(string name, EntityExpression owner)
    {
        Name = name;
        Owner = owner;
    }

    /// <summary>
    /// eg: Customer.Name => CustomerName
    /// </summary>
    /// <returns></returns>
    internal string GetFieldAlias()
    {
        return Expression.IsNull(Owner) ? Name : $"{Owner.GetFieldAlias()}{Name}";
    }
}