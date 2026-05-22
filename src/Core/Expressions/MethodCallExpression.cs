using System.Diagnostics;
using System.Reflection;
using System.Text;

namespace AppBoxCore;

public sealed class MethodCallExpression : Expression
{
    internal MethodCallExpression() { }

    public MethodCallExpression(ExpressionTypeInfo staticType, Expression? instance, string methodName,
        ExpressionTypeInfo typeInfo, Expression[]? arguments = null,
        ExpressionTypeInfo[]? genericTypes = null)
    {
        Debug.Assert(!typeInfo.IsEmpty);
        StaticType = staticType;
        Instance = instance;
        MethodName = methodName;
        GenericArguments = genericTypes;
        Arguments = arguments;
        _typeInfo = typeInfo;
    }

    public override ExpressionType NodeType => ExpressionType.MethodCallExpression;

    public ExpressionTypeInfo StaticType { get; private set; }

    public Expression? Instance { get; private set; }

    public string MethodName { get; private set; } = null!;

    public Expression[]? Arguments { get; private set; }

    public ExpressionTypeInfo[]? GenericArguments { get; private set; }

    private ExpressionTypeInfo _typeInfo;
    public override ExpressionTypeInfo TypeInfo => _typeInfo;

    public bool IsStaticMethodCall => IsNull(Instance);
    public bool IsGenericMethod => GenericArguments is { Length: > 0 };

    public override void ToCode(StringBuilder sb, int preTabs)
    {
        if (IsStaticMethodCall)
            sb.Append(StaticType.TypeName);
        else
            Instance!.ToCode(sb, preTabs);
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

        Type[]? genericTypes = null;
        if (GenericArguments is { Length: > 0 })
        {
            genericTypes = new Type[GenericArguments.Length];
            for (var i = 0; i < genericTypes.Length; i++)
            {
                genericTypes[i] = ctx.ResolveType(GenericArguments[i]);
            }
        }

        LinqExpression res;
        if (IsStaticMethodCall) //static method call
        {
            var type = ctx.ResolveType(StaticType);
            res = LinqExpression.Call(type, MethodName, genericTypes, args);
        }
        else //instance method call
        {
            var target = Instance!.ToLinqExpression(ctx)!;
            res = LinqExpression.Call(target, MethodName, genericTypes, args);
        }

        return TryLinqConvert(res, TypeInfo, ctx);
    }

    protected internal override void WriteTo(IOutputStream writer)
    {
        writer.WriteBool(IsStaticMethodCall);
        if (IsStaticMethodCall)
            StaticType.WriteTo(writer);
        else
            writer.SerializeExpression(Instance);
        writer.WriteString(MethodName);
        writer.WriteExpressionArray(Arguments);
        writer.WriteTypeInfoArray(GenericArguments);
        _typeInfo.WriteTo(writer);
        writer.WriteFieldEnd(); //保留
    }

    protected internal override void ReadFrom(IInputStream reader)
    {
        var isStaticMethodCall = reader.ReadBool();
        if (isStaticMethodCall)
            StaticType = ExpressionTypeInfo.ReadFrom(reader);
        else
            Instance = (Expression)reader.Deserialize()!;
        MethodName = reader.ReadString()!;
        Arguments = reader.ReadExpressionArray();
        GenericArguments = reader.ReadTypeInfoArray();
        _typeInfo = ExpressionTypeInfo.ReadFrom(reader);
        reader.ReadFieldId(); //保留
    }
}