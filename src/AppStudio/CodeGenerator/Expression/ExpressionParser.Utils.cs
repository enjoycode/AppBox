using AppBoxCore;
using Microsoft.CodeAnalysis;

namespace AppBoxDesign.CodeGenerator;

internal partial class ExpressionParser
{
    private static ExpressionTypeInfo MakeTypeInfo(INamedTypeSymbol typeSymbol)
    {
        //先判断是否Nullable<T>
        var isNullable = false;
        var specType = typeSymbol.SpecialType;
        var noneNullableType = typeSymbol;
        if (typeSymbol is
            {
                IsValueType: true, IsGenericType: true,
                OriginalDefinition.SpecialType: SpecialType.System_Nullable_T
            })
        {
            isNullable = true;
            specType = typeSymbol.TypeArguments[0].SpecialType;
            noneNullableType = (INamedTypeSymbol)typeSymbol.TypeArguments[0];
        }

        switch (specType)
        {
            case SpecialType.System_Boolean: return new(ExpressionTypeInfo.KnownType.Boolean, isNullable: isNullable);
            case SpecialType.System_Byte: return new(ExpressionTypeInfo.KnownType.Byte, isNullable: isNullable);
            case SpecialType.System_SByte: return new(ExpressionTypeInfo.KnownType.SByte, isNullable: isNullable);
            case SpecialType.System_Char: return new(ExpressionTypeInfo.KnownType.Char, isNullable: isNullable);
            case SpecialType.System_Int16: return new(ExpressionTypeInfo.KnownType.Int16, isNullable: isNullable);
            case SpecialType.System_UInt16: return new(ExpressionTypeInfo.KnownType.UInt16, isNullable: isNullable);
            case SpecialType.System_Int32: return new(ExpressionTypeInfo.KnownType.Int32, isNullable: isNullable);
            case SpecialType.System_UInt32: return new(ExpressionTypeInfo.KnownType.UInt32, isNullable: isNullable);
            case SpecialType.System_Int64: return new(ExpressionTypeInfo.KnownType.Int64, isNullable: isNullable);
            case SpecialType.System_UInt64: return new(ExpressionTypeInfo.KnownType.UInt64, isNullable: isNullable);
            case SpecialType.System_Single: return new(ExpressionTypeInfo.KnownType.Float, isNullable: isNullable);
            case SpecialType.System_Double: return new(ExpressionTypeInfo.KnownType.Double, isNullable: isNullable);
            case SpecialType.System_Decimal: return new(ExpressionTypeInfo.KnownType.Decimal, isNullable: isNullable);
            case SpecialType.System_DateTime: return new(ExpressionTypeInfo.KnownType.DateTime, isNullable: isNullable);
            case SpecialType.System_String: return new(ExpressionTypeInfo.KnownType.String);
            case SpecialType.System_Object: return new(ExpressionTypeInfo.KnownType.Object);
        }

        if (noneNullableType is { IsValueType: true, Name: "Guid" } &&
            noneNullableType.ContainingNamespace.Name == "System")
            return new(ExpressionTypeInfo.KnownType.Guid, isNullable: isNullable);

        // Others
        if (typeSymbol.IsGenericType)
        {
            var genericTypes = new ExpressionTypeInfo[typeSymbol.TypeArguments.Length];
            for (var i = 0; i < genericTypes.Length; i++)
            {
                genericTypes[i] = MakeTypeInfo((INamedTypeSymbol)typeSymbol.TypeArguments[i]);
            }

            if (typeSymbol.Name is "List" or "Dictionary" &&
                typeSymbol.ContainingNamespace.ToString() == "System.Collections.Generic")
            {
                var knownCollectionType = typeSymbol.Name == "List"
                    ? ExpressionTypeInfo.KnownType.List
                    : ExpressionTypeInfo.KnownType.Dictionary;
                return new ExpressionTypeInfo(knownCollectionType, false, false, genericTypes);
            }

            var fullName = $"{typeSymbol.ContainingNamespace}.{typeSymbol.MetadataName}";
            return new ExpressionTypeInfo(fullName, false, false, genericTypes);
        }

        var typeName = typeSymbol.ToString()!;
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