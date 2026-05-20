using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign.CodeGenerator;

partial class ExpressionParser
{
    public override Expression? VisitGenericName(GenericNameSyntax node)
    {
        var symbol = _semanticModel.GetSymbolInfo(node).Symbol;

        if (symbol is INamedTypeSymbol namedTypeSymbol)
            return MakeTypeExpression(namedTypeSymbol);

        throw new NotImplementedException();
    }
}