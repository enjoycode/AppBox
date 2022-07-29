using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using RoslynUtils;

namespace AppBoxDesign;

internal partial class ViewCodeGenerator
{
    public override SyntaxNode? VisitInvocationExpression(InvocationExpressionSyntax node)
    {
        var methodSymbol = ModelExtensions.GetSymbolInfo(SemanticModel, node.Expression).Symbol as IMethodSymbol;

        return base.VisitInvocationExpression(node);
    }

    private bool TryEmitInvokeAppBoxService(InvocationExpressionSyntax node,
        IMethodSymbol symbol)
    {
        if (!symbol.IsAppBoxServiceMethod()) return false;

        //需要检查返回类型内是否包含实体，是则加入引用模型列表内
        if (!symbol.ReturnsVoid)
            symbol.ReturnType.CheckTypeHasAppBoxModel(_typeSymbolCache, AddUsedModel);
        
        //转换服务方法调用为 AppBoxClient.Channel.Invoke()
        var servicePath = $"{symbol.ContainingNamespace.ContainingNamespace.Name}.{symbol.ContainingType.Name}.{symbol.Name}";
        var expression = SyntaxFactory.ParseExpression("AppBoxClient.Channel.Invoke");
        // var argList = SyntaxFactory.ArgumentList()
        // var invocation = SyntaxFactory.InvocationExpression(expression);

        return true;
    }
}