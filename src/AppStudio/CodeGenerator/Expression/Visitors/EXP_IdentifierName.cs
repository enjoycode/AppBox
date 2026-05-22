using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign.CodeGenerator;

internal partial class ExpressionParser
{
    public override ParseResult VisitIdentifierName(IdentifierNameSyntax node)
    {
        var symbol = _semanticModel.GetSymbolInfo(node).Symbol;

        if (symbol is INamespaceSymbol)
            return ParseResult.None;

        if (symbol is INamedTypeSymbol namedTypeSymbol)
            return MakeTypeInfo(namedTypeSymbol);

        throw new NotImplementedException();
    }
}