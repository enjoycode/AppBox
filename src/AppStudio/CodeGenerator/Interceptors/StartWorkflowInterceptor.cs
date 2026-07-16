using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

/// <summary>
/// 启动工作流实例的方法拦截器
/// </summary>
/// <remarks>
/// sys.Workflows.LeaveFlow.StartAsync(3);
/// 转换为
/// RuntimeContext.Invoke("sys.WorkflowService.Start", AnyValue.From([WorkflowArgument.From("Days",3)]))
/// </remarks>
internal sealed class StartWorkflowInterceptor : IInvocationInterceptor<SyntaxNode>
{
    internal const string Name = "StartWorkflow";
    internal static readonly StartWorkflowInterceptor Default = new();

    private StartWorkflowInterceptor() { }

    public SyntaxNode VisitInvocation(InvocationExpressionSyntax node, IMethodSymbol symbol,
        CSharpSyntaxVisitor<SyntaxNode> visitor)
    {
        throw new NotImplementedException();
    }
}