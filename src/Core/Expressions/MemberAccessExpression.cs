using System.Reflection;
using System.Text;

namespace AppBoxCore;

public sealed class MemberAccessExpression : Expression
{
    internal MemberAccessExpression() { }

    public MemberAccessExpression(Expression expression, string memberName, bool isField)
    {
        Expression = expression;
        MemberName = memberName;
        IsField = isField;
    }

    public override ExpressionType Type => ExpressionType.MemberAccessExpression;

    public Expression Expression { get; private set; } = null!;

    public string MemberName { get; private set; } = null!;

    public bool IsField { get; private set; }

    private MemberInfo GetMemberInfo(IExpressionContext ctx)
    {
        var type = Expression.GetRuntimeType(ctx);
        MemberInfo? memberInfo = IsField ? type.GetField(MemberName) : type.GetProperty(MemberName);
        if (memberInfo == null)
            throw new Exception($"Can't find member: {type.FullName}.{MemberName}");
        return memberInfo;
    }

    public override Type GetRuntimeType(IExpressionContext ctx)
    {
        var memberInfo = GetMemberInfo(ctx);
        return IsField ? ((FieldInfo)memberInfo).FieldType : ((PropertyInfo)memberInfo).PropertyType;
    }

    public override void ToCode(StringBuilder sb, int preTabs)
    {
        Expression.ToCode(sb, preTabs);
        sb.Append('.');
        sb.Append(MemberName);
    }

    public override LinqExpression? ToLinqExpression(IExpressionContext ctx)
    {
        var memberInfo = GetMemberInfo(ctx);
        return LinqExpression.MakeMemberAccess(Expression.ToLinqExpression(ctx), memberInfo);
    }

    protected internal override void WriteTo(IOutputStream writer)
    {
        writer.Serialize(Expression);
        writer.WriteString(MemberName);
        writer.WriteBool(IsField);
    }

    protected internal override void ReadFrom(IInputStream reader)
    {
        Expression = (Expression)reader.Deserialize()!;
        MemberName = reader.ReadString()!;
        IsField = reader.ReadBool();
    }
}