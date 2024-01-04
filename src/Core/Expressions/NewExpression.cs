using System.Text;

namespace AppBoxCore;

public sealed class NewExpression : Expression
{
    internal NewExpression() { }

    public NewExpression(TypeExpression type, Expression[]? arguments = null)
    {
        TargetType = type;
        Arguments = arguments;
    }

    public TypeExpression TargetType { get; private set; } = null!;

    public Expression[]? Arguments { get; private set; }

    public override ExpressionType Type => ExpressionType.NewExpression;

    public override void ToCode(StringBuilder sb, int preTabs)
    {
        sb.Append("new ");
        TargetType.ToCode(sb, preTabs);
        sb.Append('(');
        if (Arguments is { Length: > 0 })
        {
            for (var i = 0; i < Arguments.Length; i++)
            {
                if (i != 0) sb.Append(", ");
                if (!IsNull(Arguments[i]))
                    Arguments[i].ToCode(sb, preTabs);
            }
        }

        sb.Append(')');
    }

    public override LinqExpression? ToLinqExpression(IExpressionContext ctx)
    {
        var objectType = TargetType.GetRuntimeType(ctx);
        var argTypes = Array.Empty<Type>();
        LinqExpression[]? args = null;
        if (Arguments is { Length: > 0 })
        {
            args = new LinqExpression[Arguments.Length];
            argTypes = new Type[Arguments.Length];
            for (var i = 0; i < Arguments.Length; i++)
            {
                args[i] = Arguments[i].ToLinqExpression(ctx)!;
                argTypes[i] = args[i].Type; // Arguments[i].GetRuntimeType(ctx);
            }
        }

        var ctorInfo = objectType.GetConstructor(argTypes);
        return LinqExpression.New(ctorInfo!, args);
    }

    protected internal override void WriteTo(IOutputStream writer)
    {
        TargetType.WriteTo(writer);
        writer.WriteExpressionArray(Arguments);
        writer.WriteVariant(0); //保留
    }

    protected internal override void ReadFrom(IInputStream reader)
    {
        TargetType = new TypeExpression();
        TargetType.ReadFrom(reader);
        Arguments = reader.ReadExpressionArray();
        reader.ReadVariant(); //保留
    }
}