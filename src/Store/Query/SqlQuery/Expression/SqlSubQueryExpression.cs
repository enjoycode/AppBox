using AppBoxCore;

namespace AppBoxStore;

public sealed class SqlSubQueryExpression : Expression
{
    public SqlSubQueryExpression(SqlSubQuery subQuery)
    {
        SubQuery = subQuery;
    }

    public SqlSubQuery SubQuery { get; }

    public override ExpressionType NodeType => ExpressionType.SubQueryExpression;

    public override void ToCode(IExpressionCodeBuilder builder)
    {
        //TODO:
        var sb = builder.StringBuilder;
        // sb.Append(preTabs);
        sb.Append($"SubQuery({SubQuery})");
    }
}