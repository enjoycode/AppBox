using System.Reflection;
using System.Text;

namespace AppBoxCore;

public sealed class MethodCallExpression : Expression
{
    internal MethodCallExpression() { }

    public MethodCallExpression(Expression target, string methodName, Expression[]? arguments = null)
    {
        Target = target;
        MethodName = methodName;
        Arguments = arguments;
    }

    public override ExpressionType Type => ExpressionType.MethodCallExpression;

    public Expression Target { get; } = null!;

    public string MethodName { get; } = null!;

    public Expression[]? Arguments { get; }

    public override void ToCode(StringBuilder sb, int preTabs)
    {
        Target.ToCode(sb, preTabs);
        sb.Append('.');
        sb.Append(MethodName);
        sb.Append('(');
        if (Arguments is { Length: > 0 })
        {
            for (var i = 0; i < Arguments.Length; i++)
            {
                if (i != 0) sb.Append(", ");
                Arguments[i].ToCode(sb, preTabs);
            }
        }

        sb.Append(')');
    }

    public override LinqExpression? ToLinqExpression(IExpressionContext ctx)
    {
        LinqExpression[]? args = null;
        if (Arguments is { Length: > 0 })
        {
            args = new LinqExpression[Arguments.Length];
            for (var i = 0; i < Arguments.Length; i++)
            {
                args[i] = Arguments[i].ToLinqExpression(ctx)!;
            }
        }

        var target = Target.ToLinqExpression(ctx);
        if (target == null) //static method
        {
            var targetType = Target.GetRuntimeType(ctx);
            return LinqExpression.Call(targetType, MethodName, null /*TODO:*/, args);
        }

        return LinqExpression.Call(target, MethodName, null /*TODO:*/, args);
    }
}