using System.Text;

namespace AppBoxCore;

/// <summary>
/// 调用系统服务的表达式
/// </summary>
public sealed class InvokeServiceExpression : Expression
{
    internal InvokeServiceExpression() { }

    public InvokeServiceExpression(string appName, string serviceName, string methodName,
        ExpressionTypeInfo typeInfo, Expression[]? arguments = null)
    {
        AppName = appName;
        ServiceName = serviceName;
        MethodName = methodName;
        Arguments = arguments;
        _typeInfo = typeInfo;
    }

    public override ExpressionType NodeType => ExpressionType.InvokeServiceExpression;

    public string AppName { get; private set; } = null!;
    public string ServiceName { get; private set; } = null!;
    public string MethodName { get; private set; } = null!;

    public Expression[]? Arguments { get; private set; }

    private ExpressionTypeInfo _typeInfo;
    public override ExpressionTypeInfo TypeInfo => _typeInfo;

    public override void ToCode(StringBuilder sb, int preTabs)
    {
        sb.Append($"{AppName}.Services.{ServiceName}.{MethodName}(");
        if (Arguments != null)
        {
            for (var i = 0; i < Arguments.Length; i++)
            {
                if (i != 0) sb.Append(", ");
                Arguments[i].ToCode(sb, 0);
            }
        }

        sb.Append(')');
    }

    #region ====Serialization====

    protected internal override void WriteTo<T>(ref T writer)
    {
        writer.WriteString(AppName);
        writer.WriteString(ServiceName);
        writer.WriteString(MethodName);
        writer.WriteExpressionArray(Arguments);
        _typeInfo.WriteTo(ref writer);
    }

    protected internal override void ReadFrom<T>(ref T reader)
    {
        AppName = reader.ReadString()!;
        ServiceName = reader.ReadString()!;
        MethodName = reader.ReadString()!;
        Arguments = reader.ReadExpressionArray();
        _typeInfo = ExpressionTypeInfo.ReadFrom(ref reader);
    }

    #endregion
}