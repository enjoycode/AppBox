using System.Diagnostics;
using System.Reflection;
using System.Text;

namespace AppBoxCore;

public sealed class MemberExpression : Expression
{
    //LinqExpression只支持Property和Field

    internal MemberExpression() { }

    internal MemberExpression(ExpressionTypeInfo staticType, Expression? instance, string memberName,
        bool isField, ExpressionTypeInfo typeInfo)
    {
        Debug.Assert(!typeInfo.IsEmpty);
        StaticType = staticType;
        Instance = instance;
        MemberName = memberName;
        IsField = isField;
        _typeInfo = typeInfo;
    }

    public override ExpressionType NodeType => ExpressionType.MemberExpression;

    public ExpressionTypeInfo StaticType { get; private set; }
    public Expression? Instance { get; private set; }

    public string MemberName { get; private set; } = null!;

    public bool IsField { get; private set; }

    private ExpressionTypeInfo _typeInfo;
    public override ExpressionTypeInfo TypeInfo => _typeInfo;

    public bool IsStaticMemberAccess => IsNull(Instance);

    public override void ToCode(StringBuilder sb, int preTabs)
    {
        Instance.ToCode(sb, preTabs);
        sb.Append('.');
        sb.Append(MemberName);
    }

    public override LinqExpression? ToLinqExpression(IExpressionContext ctx)
    {
        LinqExpression res;
        if (IsStaticMemberAccess) //static member access
        {
            var type = ctx.ResolveType(StaticType);
            MemberInfo? memberInfo = IsField ? type.GetField(MemberName) : type.GetProperty(MemberName);
            res = LinqExpression.MakeMemberAccess(null, memberInfo!);
        }
        else //instance member access
        {
            var instance = Instance!.ToLinqExpression(ctx);
            var type = instance!.Type;
            MemberInfo? memberInfo = IsField ? type.GetField(MemberName) : type.GetProperty(MemberName);
            res = LinqExpression.MakeMemberAccess(instance, memberInfo!);
        }

        return TryLinqConvert(res, TypeInfo, ctx);
    }

    protected internal override void WriteTo(IOutputStream writer)
    {
        writer.WriteBool(IsStaticMemberAccess);
        if (IsStaticMemberAccess)
            StaticType.WriteTo(writer);
        else
            writer.SerializeExpression(Instance);
        writer.WriteString(MemberName);
        writer.WriteBool(IsField);
        _typeInfo.WriteTo(writer);
        writer.WriteFieldEnd(); //保留
    }

    protected internal override void ReadFrom(IInputStream reader)
    {
        var isStaticMemberAccess = reader.ReadBool();
        if (isStaticMemberAccess)
            StaticType = ExpressionTypeInfo.ReadFrom(reader);
        else
            Instance = (Expression)reader.Deserialize()!;
        MemberName = reader.ReadString()!;
        IsField = reader.ReadBool();
        _typeInfo = ExpressionTypeInfo.ReadFrom(reader);
        reader.ReadFieldId(); //保留
    }
}