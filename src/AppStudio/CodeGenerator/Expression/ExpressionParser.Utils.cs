using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;

namespace AppBoxDesign.CodeGenerator;

internal partial class ExpressionParser
{
    private static ExpressionTypeInfo MakeTypeInfo(ITypeSymbol typeSymbol)
    {
        var namedTypeSymbol = typeSymbol as INamedTypeSymbol;
        //先判断是否Nullable<T>
        var isNullable = false;
        var specType = typeSymbol.SpecialType;
        var noneNullableType = typeSymbol;
        if (typeSymbol.IsValueType && namedTypeSymbol is
                { IsGenericType: true, OriginalDefinition.SpecialType: SpecialType.System_Nullable_T })
        {
            isNullable = true;
            specType = namedTypeSymbol.TypeArguments[0].SpecialType;
            noneNullableType = namedTypeSymbol.TypeArguments[0];
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

        // Array
        if (typeSymbol is IArrayTypeSymbol arrayTypeSymbol)
        {
            var elementType = MakeTypeInfo(arrayTypeSymbol.ElementType);
            return new ExpressionTypeInfo(ExpressionTypeInfo.KnownType.Array, types: [elementType]);
        }

        // Others
        if (namedTypeSymbol is { IsGenericType: true })
        {
            var genericTypes = new ExpressionTypeInfo[namedTypeSymbol.TypeArguments.Length];
            for (var i = 0; i < genericTypes.Length; i++)
            {
                genericTypes[i] = MakeTypeInfo(namedTypeSymbol.TypeArguments[i]);
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
            //TODO: IsNullable here
            expTypeInfo = SymbolEqualityComparer.Default.Equals(typeInfo.Type, typeInfo.ConvertedType)
                ? MakeTypeInfo(typeInfo.Type)
                : MakeTypeInfo(typeInfo.ConvertedType!).WithConverted(true);
        }

        return expTypeInfo;
    }

    private ExpressionTypeInfo? TryGetConvertedType(SyntaxNode node)
    {
        var typeInfo = _semanticModel.GetTypeInfo(node);
        ExpressionTypeInfo? convertedType = null;
        if (!SymbolEqualityComparer.Default.Equals(typeInfo.Type, typeInfo.ConvertedType))
            convertedType = MakeTypeInfo(typeInfo.ConvertedType!);
        return convertedType;
    }

    private static BinaryOperatorType GetBinaryOperator(SyntaxToken token) => token.Kind() switch
    {
        SyntaxKind.PlusToken => BinaryOperatorType.Add,
        SyntaxKind.MinusToken => BinaryOperatorType.Subtract,
        SyntaxKind.AsteriskToken => BinaryOperatorType.Multiply,
        SyntaxKind.SlashToken => BinaryOperatorType.Divide,
        SyntaxKind.EqualsEqualsToken => BinaryOperatorType.Equal,
        SyntaxKind.ExclamationEqualsToken => BinaryOperatorType.NotEqual,
        SyntaxKind.GreaterThanToken => BinaryOperatorType.Greater,
        SyntaxKind.GreaterThanEqualsToken => BinaryOperatorType.GreaterOrEqual,
        SyntaxKind.LessThanToken => BinaryOperatorType.Less,
        SyntaxKind.LessThanEqualsToken => BinaryOperatorType.LessOrEqual,
        _ => throw new NotImplementedException($"Binary Operator: {token}")
    };
}