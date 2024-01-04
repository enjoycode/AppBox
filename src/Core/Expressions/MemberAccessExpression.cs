using System.Reflection;
using System.Text;

namespace AppBoxCore;

public sealed class MemberAccessExpression : Expression
{
    internal MemberAccessExpression() { }

    public MemberAccessExpression(Expression expression, string memberName, bool isField,
        TypeExpression? convertedType = null)
    {
        Expression = expression;
        MemberName = memberName;
        IsField = isField;
        ConvertedType = convertedType;
    }

    public override ExpressionType Type => ExpressionType.MemberAccessExpression;

    public Expression Expression { get; private set; } = null!;

    public string MemberName { get; private set; } = null!;

    public bool IsField { get; private set; }

    public TypeExpression? ConvertedType { get; private set; }

    public override void ToCode(StringBuilder sb, int preTabs)
    {
        Expression.ToCode(sb, preTabs);
        sb.Append('.');
        sb.Append(MemberName);
    }

    public override LinqExpression? ToLinqExpression(IExpressionContext ctx)
    {
        LinqExpression res;
        if (Expression is TypeExpression typeInfo) //static member access
        {
            var type = ctx.ResolveType(typeInfo);
            MemberInfo? memberInfo = IsField ? type.GetField(MemberName) : type.GetProperty(MemberName);
            res = LinqExpression.MakeMemberAccess(null, memberInfo!);
        }
        else //instance member access
        {
            var instance = Expression.ToLinqExpression(ctx);
            var type = instance!.Type;
            MemberInfo? memberInfo = IsField ? type.GetField(MemberName) : type.GetProperty(MemberName);
            res = LinqExpression.MakeMemberAccess(instance, memberInfo!);
        }

        return TryConvert(res, ConvertedType, ctx);
    }

    protected internal override void WriteTo(IOutputStream writer)
    {
        writer.Serialize(Expression);
        writer.WriteString(MemberName);
        writer.WriteBool(IsField);
        writer.Serialize(ConvertedType);
    }

    protected internal override void ReadFrom(IInputStream reader)
    {
        Expression = (Expression)reader.Deserialize()!;
        MemberName = reader.ReadString()!;
        IsField = reader.ReadBool();
        ConvertedType = reader.Deserialize() as TypeExpression;
    }
}