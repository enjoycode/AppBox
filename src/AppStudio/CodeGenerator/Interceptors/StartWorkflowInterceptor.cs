using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

internal sealed class StartWorkflowInterceptor : IInvocationInterceptor<SyntaxNode>
{
    internal const string Name = "StartWorkflow";
    internal static readonly StartWorkflowInterceptor Default = new();
    
    private StartWorkflowInterceptor() {}
    
    public SyntaxNode VisitInvocation(InvocationExpressionSyntax node, IMethodSymbol symbol, CSharpSyntaxVisitor<SyntaxNode> visitor)
    {
        throw new NotImplementedException();
    }
}