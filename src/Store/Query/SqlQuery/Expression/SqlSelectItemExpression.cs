using System.Text;
using AppBoxCore;

namespace AppBoxStore;

public sealed class SqlSelectItemExpression : Expression //TODO: rename to SqlSelectItem
{
    public SqlSelectItemExpression(Expression expression)
    {
        switch (expression.Type)
        {
            case ExpressionType.EntityFieldExpression:
                //case ExpressionType.AggregationRefFieldExpression:
                Expression = expression;
                AliasName = ((EntityPathExpression)expression).Name;
                break;
            case ExpressionType.SelectItemExpression:
                Expression = expression;
                AliasName = ((SqlSelectItemExpression)expression).AliasName;
                break;
            default:
                Expression = expression;
                AliasName = "unnamed"; //TODO: keep null?
                break;
        }
    }

    public SqlSelectItemExpression(Expression expression, string aliasName)
    {
        Expression = expression;
        AliasName = aliasName;
    }

    public string? AliasName { get; internal set; }

    public ISqlSelectQuery? Owner { get; internal set; }

    public Expression Expression { get; }

    public override ExpressionType Type => ExpressionType.SelectItemExpression;

    public override void ToCode(StringBuilder sb, string? preTabs)
    {
        Expression.ToCode(sb, preTabs);
        sb.Append(" As ");
        sb.Append(AliasName);
    }
}