using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using RoslynUtils;

namespace AppBoxDesign;

partial class ViewCodeGenerator
{
    public override SyntaxNode? VisitInvocationExpression(InvocationExpressionSyntax node)
    {
        var methodSymbol = SemanticModel.GetSymbolInfo(node.Expression).Symbol as IMethodSymbol;

        return base.VisitInvocationExpression(node);
    }

    private static bool TryEmitInvokeAppBoxService(InvocationExpressionSyntax node,
        IMethodSymbol symbol)
    {
        if (!symbol.IsAppBoxServiceMethod()) return false;

        //需要检查返回类型内是否包含实体，是则加入引用模型列表内
        // if (!symbol.ReturnsVoid)
        //     emitter.CheckTypeHasAppBoxModel(symbol.ReturnType);
        
        return true;
    }
}