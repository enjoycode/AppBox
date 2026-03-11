using System.Text;
using AppBoxCore;

namespace AppBoxStore;

public sealed class SqlParameterExpression : Expression
{
    public override ExpressionType Type { get; } = ExpressionType.DbParameterExpression;

    public override void ToCode(StringBuilder sb, int preTabs)
    {
        throw new NotImplementedException();
    }
}