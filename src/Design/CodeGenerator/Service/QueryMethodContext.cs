using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

/// <summary>
/// 查询方法的相关信息
/// </summary>
internal sealed class QueryMethod
{
    public string MethodName = null!;

    public bool IsSystemQuery; //标明是否系统存储查询，否则表示其他如Sql查询

    public bool InLambdaExpression;

    public ParameterSyntax[]? LambdaParameters; 

    //internal bool IsIncludeMethod => MethodName == "Include" || MethodName == "ThenInclude";

    internal bool IsDynamicMethod => MethodName == "ToListAsync" || MethodName == "Output";
}

/// <summary>
/// 查询方法Stack
/// </summary>
internal sealed class QueryMethodContext
{
    private readonly Stack<QueryMethod> methodsStack = new();

    internal bool HasAny => methodsStack.Count > 0;

    internal QueryMethod Current => methodsStack.Peek();

    internal void Push(QueryMethod method) => methodsStack.Push(method);

    internal void Pop() => methodsStack.Pop();
}