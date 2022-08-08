using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using RoslynUtils;

namespace AppBoxDesign;

/// <summary>
/// 转换服务调用服务的代码，eg:
/// var res = await sys.Services.HelloService.SayHello("aa", 123)
/// var res = await HostRuntimeContext.Invoke<string>("sys.HelloService.SayHello", InvokeArgs.Make("aa", 123))
/// </summary>
internal sealed class CallServiceInterceptor : IInvocationInterceptor<SyntaxNode>
{
    internal const string Name = "CallService";

    public SyntaxNode VisitInvocation(InvocationExpressionSyntax node, IMethodSymbol symbol,
        CSharpSyntaxVisitor<SyntaxNode> visitor)
    {
        var generator = (ServiceCodeGenerator)visitor!;
        //返回类型是Task<T>或Task
        var isReturnGenericTask = ((INamedTypeSymbol)symbol.ReturnType).IsGenericType;
        //需要检查返回类型内是否包含实体，是则加入引用模型列表内
        if (isReturnGenericTask)
            symbol.ReturnType.CheckTypeHasAppBoxModel(generator.TypeSymbolCache,
                generator.AddUsedEntity);

        //转换服务方法调用为 HostRuntimeContext.Invoke
        var servicePath =
            $"{symbol.ContainingNamespace.ContainingNamespace.Name}.{symbol.ContainingType.Name}.{symbol.Name}";
        var methodName = "AppBoxServer.HostRuntimeContext.Invoke";
        if (isReturnGenericTask)
        {
            var rt = ((INamedTypeSymbol)symbol.ReturnType).TypeArguments[0];
            methodName += $"<{rt}>";
        }

        var method = SyntaxFactory.ParseExpression(methodName);
        var serviceArg = SyntaxFactory.Argument(
            SyntaxFactory.LiteralExpression(SyntaxKind.StringLiteralExpression,
                SyntaxFactory.Literal(servicePath))
        );
        var args = SyntaxFactory.ArgumentList().AddArguments(serviceArg);
        if (node.ArgumentList.Arguments.Count == 0)
        {
            var emptyArgs = SyntaxFactory.ParseExpression("InvokeArgs.Empty");
            args = args.AddArguments(SyntaxFactory.Argument(emptyArgs));
        }
        else
        {
            var argList = SyntaxFactory.ArgumentList(node.ArgumentList.Arguments);
            var makeMethod = SyntaxFactory.ParseExpression("InvokeArgs.Make");
            var makeArgs = SyntaxFactory.InvocationExpression(makeMethod, argList);
            args = args.AddArguments(SyntaxFactory.Argument(makeArgs));
        }

        var res = SyntaxFactory.InvocationExpression(method, args)
            .WithTriviaFrom(node);
        return res;
    }
}