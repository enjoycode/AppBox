using System;
using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign.CodeGenerator;

internal partial class ExpressionParser
{
    public override Expression? VisitIdentifierName(IdentifierNameSyntax node)
    {
        var symbol = _semanticModel.GetSymbolInfo(node).Symbol;

        if (symbol is INamespaceSymbol)
            return null;

        if (symbol is INamedTypeSymbol namedTypeSymbol)
            return MakeTypeExpression(namedTypeSymbol);

        throw new NotImplementedException();
    }
}