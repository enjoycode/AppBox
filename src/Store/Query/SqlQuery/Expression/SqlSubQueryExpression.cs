using System.Text;
using AppBoxCore;

namespace AppBoxStore;

public sealed class SqlSubQueryExpression : Expression
{
    public SqlSubQueryExpression(SqlSubQuery subQuery)
    {
        SubQuery = subQuery;
    }

    public SqlSubQuery SubQuery { get; }

    public override ExpressionType Type => ExpressionType.SubQueryExpression;

    public override void ToCode(StringBuilder sb, int preTabs)
    {
        //TODO:
        sb.Append(preTabs);
        sb.Append($"SubQuery({SubQuery})");
    }
}