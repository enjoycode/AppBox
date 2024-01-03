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

    public Expression Target { get; private set; } = null!;

    public string MethodName { get; private set; } = null!;

    public Expression[]? Arguments { get; private set; }

    public TypeExpression[]? GenericArguments { get; private set; }

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
                if (!IsNull(Arguments[i])) //maybe null on some error
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

    protected internal override void WriteTo(IOutputStream writer)
    {
        writer.Serialize(Target);
        writer.WriteString(MethodName);
        writer.WriteExpressionArray(Arguments);
        writer.WriteTypeExpressionArray(GenericArguments);
    }

    protected internal override void ReadFrom(IInputStream reader)
    {
        Target = (Expression)reader.Deserialize()!;
        MethodName = reader.ReadString()!;
        Arguments = reader.ReadExpressionArray();
        GenericArguments = reader.ReadTypeExpressionArray();
    }
}