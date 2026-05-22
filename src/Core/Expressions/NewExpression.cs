using System.Diagnostics;
using System.Text;

namespace AppBoxCore;

public sealed class NewExpression : Expression
{
    internal NewExpression() { }

    public NewExpression(ExpressionTypeInfo type, Expression[]? arguments = null,
        ExpressionTypeInfo? convertedType = null)
    {
        TargetType = type;
        Arguments = arguments;
        ConvertedType = convertedType;

#if DEBUG
        if (convertedType.HasValue)
            Debug.Assert(convertedType.Value.IsConverted);
#endif
    }

    public ExpressionTypeInfo TargetType { get; private set; }

    public Expression[]? Arguments { get; private set; }

    public ExpressionTypeInfo? ConvertedType { get; private set; }

    public override ExpressionTypeInfo TypeInfo => ConvertedType ?? TargetType;

    public override ExpressionType NodeType => ExpressionType.NewExpression;

    public override void ToCode(StringBuilder sb, int preTabs)
    {
        sb.Append("new ");
        sb.Append(TargetType.TypeName);
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
        var argTypes = Array.Empty<Type>();
        LinqExpression[]? args = null;
        if (Arguments is { Length: > 0 })
        {
            args = new LinqExpression[Arguments.Length];
            argTypes = new Type[Arguments.Length];
            for (var i = 0; i < Arguments.Length; i++)
            {
                args[i] = Arguments[i].ToLinqExpression(ctx)!;
                argTypes[i] = args[i].Type;
            }
        }

        var objectType = ctx.ResolveType(TargetType);
        var ctorInfo = objectType.GetConstructor(argTypes)!;
        if (ConvertedType.HasValue)
            return TryLinqConvert(LinqExpression.New(ctorInfo, args), ConvertedType.Value, ctx);
        return LinqExpression.New(ctorInfo, args);
    }

    protected internal override void WriteTo(IOutputStream writer)
    {
        TargetType.WriteTo(writer);
        writer.WriteExpressionArray(Arguments);
        writer.WriteBool(ConvertedType.HasValue);
        ConvertedType?.WriteTo(writer);
        writer.WriteVariant(0); //保留
    }

    protected internal override void ReadFrom(IInputStream reader)
    {
        TargetType = ExpressionTypeInfo.ReadFrom(reader);
        Arguments = reader.ReadExpressionArray();
        var hasConvertedType = reader.ReadBool();
        if (hasConvertedType)
            ConvertedType = ExpressionTypeInfo.ReadFrom(reader);
        reader.ReadVariant(); //保留
    }
}