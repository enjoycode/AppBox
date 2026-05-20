using System;
using AppBoxCore;
using Microsoft.CodeAnalysis;

namespace AppBoxDesign.CodeGenerator;

internal partial class ExpressionParser
{
    private static TypeExpression MakeTypeExpression(INamedTypeSymbol namedTypeSymbol)
    {
        if (namedTypeSymbol.IsGenericType)
        {
            var genericTypes = new TypeExpression[namedTypeSymbol.TypeArguments.Length];
            for (var i = 0; i < genericTypes.Length; i++)
            {
                genericTypes[i] = MakeTypeExpression((INamedTypeSymbol)namedTypeSymbol.TypeArguments[i]);
            }

            var fullName = $"{namedTypeSymbol.ContainingNamespace}.{namedTypeSymbol.MetadataName}";
            return new TypeExpression(fullName, genericTypes);
        }

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