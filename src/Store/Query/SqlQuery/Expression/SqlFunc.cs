using System.Collections;
using System.Text;
using AppBoxCore;

namespace AppBoxStore;

public sealed class SqlFunc : Expression
{
    private SqlFunc(string name, params Expression[]? arguments)
    {
        Name = name;
        Arguments = arguments;
    }

    public readonly string Name;
    public readonly Expression[]? Arguments;

    public override ExpressionType Type => ExpressionType.DbFuncExpression;

    public override void ToCode(StringBuilder sb, string? preTabs) => sb.Append($"{Name}()"); //TODO:

    public static Expression Sum(Expression field) => new SqlFunc("Sum", field);

    public static Expression Avg(Expression field) => new SqlFunc("Avg", field);

    public static Expression Max(Expression field) => new SqlFunc("Max", field);

    public static Expression Min(Expression field) => new SqlFunc("Min", field);

    public static BinaryExpression In(Expression field, SqlSubQuery subQuery) =>
        new(field, subQuery, BinaryOperatorType.In);

    public static BinaryExpression In(Expression field, IList list) =>
        new(field, new PrimitiveExpression(list), BinaryOperatorType.In);
}