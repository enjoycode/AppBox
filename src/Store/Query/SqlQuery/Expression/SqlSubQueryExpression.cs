using System.Text;
using AppBoxCore;

namespace AppBoxStore;

public sealed class SqlSubQueryExpression : Expression
{
    public SqlSubQueryExpression(SqlSubQuery subQuery)
    {
        _subQuery = subQuery;
    }

    private readonly SqlSubQuery _subQuery;
    public override ExpressionType Type => ExpressionType.SubQueryExpression;

    public override void ToCode(StringBuilder sb, int preTabs)
    {
        //TODO:
        sb.Append(preTabs);
        sb.Append($"SubQuery({_subQuery})");
    }

    public static implicit operator SqlSubQueryExpression(SqlSubQuery subQuery) => new(subQuery);
}