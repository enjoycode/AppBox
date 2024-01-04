using AppBoxCore;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign.CodeGenerator;

internal partial class ExpressionParser
{
    public override Expression? VisitObjectCreationExpression(ObjectCreationExpressionSyntax node)
    {
        var ctorMethodSymbol = _semanticModel.GetSymbolInfo(node).Symbol;
        var typeSymbol = ctorMethodSymbol!.ContainingType!;

        var typeExp = MakeTypeExpression(typeSymbol);
        Expression[]? args = null;
        if (node.ArgumentList is { Arguments.Count: > 0 })
        {
            args = new Expression[node.ArgumentList.Arguments.Count];
            for (var i = 0; i < node.ArgumentList.Arguments.Count; i++)
            {
                args[i] = node.ArgumentList.Arguments[i].Expression.Accept(this)!;
            }
        }

        return new NewExpression(typeExp, args);
    }
}