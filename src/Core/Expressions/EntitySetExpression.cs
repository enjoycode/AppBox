using System.Text;

namespace AppBoxCore;

public sealed class EntitySetExpression : Expression, IEntityPathExpression
{
    public EntitySetExpression(string name, long setModelId, EntityExpression owner)
    {
        Name = name;
        Owner = owner;
        _entitySetModelId = setModelId;
    }

    private readonly long _entitySetModelId;
    private EntityExpression? _root;

    public string Name { get; }

    public EntityExpression Owner { get; }

    public override ExpressionType Type => ExpressionType.EntitySetExpression;

    public EntityExpression RootEntityExpression
    {
        get
        {
            if (IsNull(_root))
                _root = new EntityExpression(_entitySetModelId, null /*必须null，后面设置*/);
            return _root!;
        }
    }

    public override void ToCode(StringBuilder sb, int preTabs)
    {
        Owner!.ToCode(sb, preTabs);
        sb.Append('.');
        sb.Append(Name);
    }
}