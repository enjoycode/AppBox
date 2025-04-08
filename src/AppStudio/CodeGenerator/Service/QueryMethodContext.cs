using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

/// <summary>
/// 查询方法的相关信息
/// </summary>
internal sealed class QueryMethod
{
    public QueryMethod(string methodName, int parameterCount, bool isSystemQuery = false)
    {
        MethodName = methodName;
        ParameterCount = parameterCount;
        IsSystemQuery = isSystemQuery;
    }

    public readonly string MethodName;

    /// <summary>
    /// 查询方法的参数个数，用于附加判断是否动态查询
    /// </summary>
    public readonly int ParameterCount;

    /// <summary>
    /// 保留: 标明是否系统存储查询，否则表示其他如Sql查询
    /// </summary>
    public readonly bool IsSystemQuery;

    public bool InLambdaExpression;

    public ParameterSyntax[]? LambdaParameters; //eg: (t, j1, j2) => {}

    /// <summary>
    /// 是否动态查询方法，最后一个参数会转换为两个参数或三个参数(ToDynamicListAsync)
    /// </summary>
    internal bool IsDynamicMethod => MethodName == "Output"
                                     || MethodName == "ToScalarAsync"
                                     || (MethodName == "ToListAsync" && ParameterCount > 0)
                                     || (MethodName == "ToDataTableAsync" && ParameterCount > 0);

    internal bool IsLambdaParameter(IdentifierNameSyntax identifier)
    {
        //TODO:暂简单判断名称是否相同
        if (LambdaParameters == null || LambdaParameters.Length == 0) return false;

        return LambdaParameters.Any(p => p.Identifier.ValueText == identifier.Identifier.Text);
    }
}

/// <summary>
/// 查询方法Stack
/// </summary>
internal sealed class QueryMethodContext
{
    private readonly Stack<QueryMethod> _methodsStack = new();

    internal bool HasAny => _methodsStack.Count > 0;

    internal QueryMethod Current => _methodsStack.Peek();

    internal void Push(QueryMethod method) => _methodsStack.Push(method);

    internal void Pop() => _methodsStack.Pop();
}