using System.Text;

namespace AppBoxCore;

public sealed class EntitySetExpression : EntityPathExpression
{
    public EntitySetExpression(string name, EntityExpression owner, long setModelId)
        : base(name, owner)
    {
        _entitySetModelId = setModelId;
    }

    private readonly long _entitySetModelId;
    private EntityExpression? _root;

    public override ExpressionType Type => ExpressionType.EntitySetExpression;

    public override EntityPathExpression this[string name] => throw new NotSupportedException();

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
        sb.Append(".");
        sb.Append(Name);
    }
}