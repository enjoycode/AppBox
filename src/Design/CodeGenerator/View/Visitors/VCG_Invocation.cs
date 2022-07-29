using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

partial class ViewCodeGenerator
{
    public override SyntaxNode? VisitInvocationExpression(InvocationExpressionSyntax node)
    {
        var methodSymbol =
            ModelExtensions.GetSymbolInfo(SemanticModel, node.Expression).Symbol as IMethodSymbol;
        
        return base.VisitInvocationExpression(node);
    }
}