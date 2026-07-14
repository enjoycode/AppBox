using AppBoxCore;

namespace AppBoxStore;

public sealed class SqlParameterExpression : Expression
{
    public override ExpressionType NodeType { get; } = ExpressionType.DbParameterExpression;

    public override void ToCode(IExpressionCodeBuilder builder)
    {
        throw new NotImplementedException();
    }
}