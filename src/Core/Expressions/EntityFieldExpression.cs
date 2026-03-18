using System.Text;

namespace AppBoxCore;

public sealed class EntityFieldExpression : Expression, IEntityPathExpression
{
    internal EntityFieldExpression(string name, EntityExpression owner)
    {
        Name = name;
        Owner = owner;
    }
    
    public string Name { get; }

    public EntityExpression Owner { get; }
    
    /// <summary>
    /// eg: Customer.Name => CustomerName
    /// </summary>
    /// <returns></returns>
    internal string GetFieldAlias() => $"{Owner.GetFieldAlias()}{Name}";

    #region ====Overrides====

    public override ExpressionType Type => ExpressionType.EntityFieldExpression;

    public override bool Equals(object? obj)
    {
        if (obj == null)
            return false;

        if (ReferenceEquals(this, obj))
            return true;

        var target = obj as EntityFieldExpression;
        if (Equals(null, target))
            return false;

        return Equals(target.Owner, Owner) && target.Name == Name;
    }

    public override int GetHashCode()
    {
        return HashCode.Combine(Owner!, Name!);
    }

    public override string ToString()
    {
        return $"{Owner!}.{Name!}";
    }

    public override void ToCode(StringBuilder sb, int preTabs)
    {
        Owner!.ToCode(sb, preTabs);
        sb.Append('.');
        sb.Append(Name);
    }

    #endregion

    #region ====Serialization====

    protected internal override void WriteTo(IOutputStream writer)
    {
        writer.SerializeExpression(Owner);
        writer.WriteString(Name);
    }

    internal static EntityFieldExpression Read(IInputStream reader)
    {
        var owner = (EntityExpression)reader.Deserialize()!;
        var name = reader.ReadString()!;

        if (owner.TryGetExistsMember(name, out var exists))
            return (EntityFieldExpression)exists;

        var member = new EntityFieldExpression(name, owner);
        owner.AddMemberToCache(name, member);
        return member;
    }

    #endregion
}