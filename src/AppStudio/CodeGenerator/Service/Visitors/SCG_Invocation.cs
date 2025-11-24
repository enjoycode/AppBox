using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

internal partial class ServiceCodeGenerator
{
    public override SyntaxNode? VisitInvocationExpression(InvocationExpressionSyntax node)
    {
        var methodSymbol = SemanticModel.GetSymbolInfo(node.Expression).Symbol as IMethodSymbol;

        //先判断有无拦截器
        var interceptor = GetInvocationInterceptor(methodSymbol);
        if (interceptor != null)
            return interceptor.VisitInvocation(node, methodSymbol!, this!);

        //再判断是否查询方法,需要设置上下文特殊处理相关的Lambda
        var isQueryMethod = IsQueryMethod(methodSymbol);
        if (isQueryMethod)
        {
            //设置当前查询方法上下文
            var queryMethod = new QueryMethod(methodSymbol!.Name, methodSymbol.Parameters.Length);
            _queryMethodCtx.Push(queryMethod);
        }

        var res = base.VisitInvocationExpression(node)!;

        if (isQueryMethod)
        {
            //将ToScalar转换为ToScalar<T>
            if (_queryMethodCtx.Current.MethodName == "ToScalarAsync")
            {
                var memberAccess = (MemberAccessExpressionSyntax)node.Expression;
                var newGenericName = (SimpleNameSyntax)SyntaxFactory.ParseName(
                    $"ToScalarAsync<{methodSymbol!.TypeArguments[0]}>");
                memberAccess = memberAccess.WithName(newGenericName);
                res = ((InvocationExpressionSyntax)res).WithExpression(memberAccess);
            }

            _queryMethodCtx.Pop();
        }

        return res;
    }

    private static bool IsQueryMethod(IMethodSymbol? methodSymbol)
    {
        return methodSymbol != null &&
               methodSymbol.GetAttributes()
                   .Any(a => a.AttributeClass != null &&
                             a.AttributeClass.ToString() == "AppBoxStore.QueryMethodAttribute");
    }
}