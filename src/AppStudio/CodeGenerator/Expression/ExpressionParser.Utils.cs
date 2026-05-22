using System;
using AppBoxCore;
using Microsoft.CodeAnalysis;

namespace AppBoxDesign.CodeGenerator;

internal partial class ExpressionParser
{
    private static ExpressionTypeInfo MakeTypeInfo(INamedTypeSymbol namedTypeSymbol)
    {
        if (namedTypeSymbol.IsGenericType)
        {
            var genericTypes = new ExpressionTypeInfo[namedTypeSymbol.TypeArguments.Length];
            for (var i = 0; i < genericTypes.Length; i++)
            {
                genericTypes[i] = MakeTypeInfo((INamedTypeSymbol)namedTypeSymbol.TypeArguments[i]);
            }

            var fullName = $"{namedTypeSymbol.ContainingNamespace}.{namedTypeSymbol.MetadataName}";
            return new ExpressionTypeInfo(fullName, false, false, genericTypes);
        }

        var typeName = namedTypeSymbol.ToString()!;
        var isNullable = false;
        if (typeName.EndsWith('?'))
        {
            typeName = typeName[..^1];
            isNullable = true;
        }

        return new ExpressionTypeInfo(typeName, isNullable: isNullable);
    }

    private ExpressionTypeInfo? TryGetTypeInfoWithConverted(SyntaxNode node)
    {
        var typeInfo = _semanticModel.GetTypeInfo(node);
        ExpressionTypeInfo? expTypeInfo = null;
        if (typeInfo.Type != null)
        {
            expTypeInfo = SymbolEqualityComparer.Default.Equals(typeInfo.Type, typeInfo.ConvertedType)
                ? MakeTypeInfo((INamedTypeSymbol)typeInfo.Type)
                : MakeTypeInfo((INamedTypeSymbol)typeInfo.ConvertedType!).WithConverted(true);
        }
        return expTypeInfo;
    }

    private ExpressionTypeInfo? TryGetConvertedType(SyntaxNode node)
    {
        var typeInfo = _semanticModel.GetTypeInfo(node);
        ExpressionTypeInfo? convertedType = null;
        if (!SymbolEqualityComparer.Default.Equals(typeInfo.Type, typeInfo.ConvertedType))
            convertedType = MakeTypeInfo((INamedTypeSymbol)typeInfo.ConvertedType!);
        return convertedType;
    }
}