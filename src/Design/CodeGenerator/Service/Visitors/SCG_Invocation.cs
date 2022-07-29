using System.Linq.Expressions;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

internal partial class ServiceCodeGenerator
{
    public override SyntaxNode? VisitInvocationExpression(InvocationExpressionSyntax node)
    {
        var methodSymbol = SemanticModel.GetSymbolInfo(node.Expression).Symbol as IMethodSymbol;
        var needPopQueryMethod = false;
        if (IsQueryMethod(methodSymbol))
        {
            //设置当前查询方法上下文
            var queryMethod = new QueryMethod()
            {
                IsSystemQuery = false, //TODO: fix
                MethodName = methodSymbol!.Name,
                ArgsCount = node.ArgumentList.Arguments.Count,
                Identifiers = null,
                LambdaParameters = null,
            };
            queryMethodCtx.Push(queryMethod);
            needPopQueryMethod = true;

            if (!queryMethod.IsIncludeMethod) //排除Include类方法
            {
                //注意：目前只支持所有的非Lambda参数为IdentifierNameSyntax
                queryMethod.Identifiers = new IdentifierNameSyntax[queryMethod.ArgsCount];
                queryMethod.LambdaParameters = new string[queryMethod.ArgsCount];
                queryMethod.Identifiers[0] = GetIdentifier(node.Expression); //指向自己
                if (queryMethod.ArgsCount > 1)
                {
                    //注意：这里不移除无效的参数节点，由VisitArgumentList()处理
                    for (var i = 0; i < queryMethod.ArgsCount - 1; i++)
                    {
                        queryMethod.Identifiers[i + 1] =
                            (IdentifierNameSyntax)node.ArgumentList.Arguments[i].Expression;
                    }
                }
            }
        }

        var res = base.VisitInvocationExpression(node)!;

        if (needPopQueryMethod)
        {
            //将ToScalar转换为ToScalar<T>
            if (queryMethodCtx.Current.MethodName == "ToScalarAsync")
            {
                var memberAccess = (MemberAccessExpressionSyntax)node.Expression;
                var newGenericName =
                    (SimpleNameSyntax)SyntaxFactory.ParseName(
                        $"ToScalarAsync<{methodSymbol!.TypeArguments[0]}>");
                memberAccess = memberAccess.WithName(newGenericName);
                res = ((InvocationExpressionSyntax)res).WithExpression(memberAccess);
            }

            queryMethodCtx.Pop();
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

    // 从q.OrderBy(t => t.Name).OrderBy(o => o.Code)获取q
    private static IdentifierNameSyntax GetIdentifier(ExpressionSyntax expression)
    {
        if (expression is InvocationExpressionSyntax invoke)
            return GetIdentifier(invoke.Expression);
        if (expression is MemberAccessExpressionSyntax memberAccess)
            return GetIdentifier(memberAccess.Expression);
        if (expression is IdentifierNameSyntax identifier)
            return identifier;
        throw new NotSupportedException($"expression type: {expression.GetType().Name}");
    }
}