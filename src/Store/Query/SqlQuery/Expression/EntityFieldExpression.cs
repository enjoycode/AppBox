using System;
using System.Text;
using AppBoxCore;

namespace AppBoxStore;

public sealed class EntityFieldExpression : EntityPathExpression
{
    public override ExpressionType Type => ExpressionType.EntityFieldExpression;

    public override EntityPathExpression this[string name] => throw new InvalidOperationException();

    /// <summary>
    /// Ctor for Serialization
    /// </summary>
    internal EntityFieldExpression() { }

    internal EntityFieldExpression(string name, EntityExpression owner) : base(name, owner) { }

    #region ====Overrides====

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
        return Owner!.GetHashCode() ^ Name!.GetHashCode();
    }

    public override string ToString()
    {
        return $"{Owner!}.{Name!}";
    }

    public override void ToCode(StringBuilder sb, int preTabs)
    {
        Owner!.ToCode(sb, preTabs);
        sb.Append(".");
        sb.Append(Name);
    }

    #endregion
}