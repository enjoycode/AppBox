using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using RoslynUtils;

namespace AppBoxDesign;

/// <summary>
/// 转换服务调用服务的代码，eg:
/// var res = await sys.Services.HelloService.SayHello("aa", 123)
/// var res = await HostRuntimeContext.Invoke~string~("sys.HelloService.SayHello", AnyValue.From("aa"), AnyValue.From(123))
/// </summary>
internal sealed class CallServiceInterceptor : IInvocationInterceptor<SyntaxNode>
{
    internal const string Name = "CallService";

    public SyntaxNode VisitInvocation(InvocationExpressionSyntax node, IMethodSymbol symbol,
        CSharpSyntaxVisitor<SyntaxNode> visitor)
    {
        var generator = (ServiceCodeGenerator)visitor!;
        return CodeGeneratorUtil.VisitInvokeAppBoxService(generator, node, symbol);
    }
}