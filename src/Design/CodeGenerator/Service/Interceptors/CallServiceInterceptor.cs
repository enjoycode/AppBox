using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

/// <summary>
/// 转换服务调用服务的代码，eg:
/// var res = await sys.Services.HelloService.SayHello("aa", 123)
/// var res = await RuntimeContext.InvokeAsync<string>(InvokeArgs.Make("aa", 123))
/// </summary>
internal sealed class CallServiceInterceptor : IInvocationInterceptor<SyntaxNode>
{
    internal const string Name = "CallService";

    public SyntaxNode VisitInvocation(InvocationExpressionSyntax node, IMethodSymbol symbol,
        CSharpSyntaxVisitor<SyntaxNode> visitor)
    {
        throw new NotImplementedException();
    }
}