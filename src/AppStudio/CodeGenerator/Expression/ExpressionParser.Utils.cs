using System;
using AppBoxCore;
using Microsoft.CodeAnalysis;

namespace AppBoxDesign.CodeGenerator;

internal partial class ExpressionParser
{
    private static TypeExpression MakeTypeExpression(INamedTypeSymbol namedTypeSymbol)
    {
        if (namedTypeSymbol.IsGenericType)
            throw new NotImplementedException();

        return new TypeExpression(namedTypeSymbol.ToString()!);
    }

    private TypeExpression? GetConvertedType(SyntaxNode node)
    {
        var typeInfo = _semanticModel.GetTypeInfo(node);
        TypeExpression? convertedType = null;
        if (!SymbolEqualityComparer.Default.Equals(typeInfo.Type, typeInfo.ConvertedType))
            convertedType = MakeTypeExpression((INamedTypeSymbol)typeInfo.ConvertedType!);
        return convertedType;
    }
}