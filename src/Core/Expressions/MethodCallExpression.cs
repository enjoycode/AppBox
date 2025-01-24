using System.Reflection;
using System.Text;

namespace AppBoxCore;

public sealed class MethodCallExpression : Expression
{
    internal MethodCallExpression() { }

    public MethodCallExpression(Expression target, string methodName, Expression[]? arguments = null,
        TypeExpression? convertedType = null)
    {
        Target = target;
        MethodName = methodName;
        Arguments = arguments;
        ConvertedType = convertedType;
    }

    public override ExpressionType Type => ExpressionType.MethodCallExpression;

    public Expression Target { get; private set; } = null!;

    public string MethodName { get; private set; } = null!;

    public Expression[]? Arguments { get; private set; }

    public TypeExpression[]? GenericArguments { get; private set; }

    public TypeExpression? ConvertedType { get; private set; }

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

        LinqExpression res;
        if (Target is TypeExpression typeInfo) //static method call
        {
            var type = ctx.ResolveType(typeInfo);
            res = LinqExpression.Call(type, MethodName, null /*TODO:*/, args);
        }
        else
        {
            //instance method call
            var target = Target.ToLinqExpression(ctx)!;
            res = LinqExpression.Call(target, MethodName, null /*TODO:*/, args);
        }

        return TryConvert(res, ConvertedType, ctx);
    }

    protected internal override void WriteTo(IOutputStream writer)
    {
        writer.SerializeExpression(Target);
        writer.WriteString(MethodName);
        writer.WriteExpressionArray(Arguments);
        writer.WriteTypeExpressionArray(GenericArguments);
        writer.SerializeExpression(ConvertedType);
    }

    protected internal override void ReadFrom(IInputStream reader)
    {
        Target = (Expression)reader.Deserialize()!;
        MethodName = reader.ReadString()!;
        Arguments = reader.ReadExpressionArray();
        GenericArguments = reader.ReadTypeExpressionArray();
        ConvertedType = reader.Deserialize() as TypeExpression;
    }
}