using System.Diagnostics;
using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign.CodeGenerator;

partial class ExpressionParser
{
    public override ParseResult VisitIdentifierName(IdentifierNameSyntax node)
    {
        var symbol = _semanticModel.GetSymbolInfo(node).Symbol;

        if (symbol is INamespaceSymbol)
            return ParseResult.None;

        if (symbol is ITypeSymbol typeSymbol)
            return MakeTypeInfo(typeSymbol);

        throw new NotImplementedException();
    }

    public override ParseResult VisitNullableType(NullableTypeSyntax node)
    {
        var element = Visit(node.ElementType);
        Debug.Assert(element.IsTypeInfo);
        return element.TypeInfo.WithNullable(true);
    }

    public override ParseResult VisitArrayType(ArrayTypeSyntax node)
    {
        var element = Visit(node.ElementType);
        Debug.Assert(element.IsTypeInfo);
        return new ExpressionTypeInfo(ExpressionTypeInfo.KnownType.Array, types: [element.TypeInfo]);
    }

    public override ParseResult VisitGenericName(GenericNameSyntax node)
    {
        var symbol = _semanticModel.GetSymbolInfo(node).Symbol;

        if (symbol is ITypeSymbol typeSymbol)
            return MakeTypeInfo(typeSymbol);

        throw new NotImplementedException();
    }

    public override ParseResult VisitPredefinedType(PredefinedTypeSyntax node)
    {
        return node.Keyword.Kind() switch
        {
            SyntaxKind.BoolKeyword => new ExpressionTypeInfo(ExpressionTypeInfo.KnownType.Boolean),
            SyntaxKind.ByteKeyword => new ExpressionTypeInfo(ExpressionTypeInfo.KnownType.Byte),
            SyntaxKind.SByteKeyword => new ExpressionTypeInfo(ExpressionTypeInfo.KnownType.SByte),
            SyntaxKind.CharKeyword => new ExpressionTypeInfo(ExpressionTypeInfo.KnownType.Char),
            SyntaxKind.ShortKeyword => new ExpressionTypeInfo(ExpressionTypeInfo.KnownType.Int16),
            SyntaxKind.UShortKeyword => new ExpressionTypeInfo(ExpressionTypeInfo.KnownType.UInt16),
            SyntaxKind.IntKeyword => new ExpressionTypeInfo(ExpressionTypeInfo.KnownType.Int32),
            SyntaxKind.UIntKeyword => new ExpressionTypeInfo(ExpressionTypeInfo.KnownType.UInt32),
            SyntaxKind.LongKeyword => new ExpressionTypeInfo(ExpressionTypeInfo.KnownType.Int64),
            SyntaxKind.ULongKeyword => new ExpressionTypeInfo(ExpressionTypeInfo.KnownType.UInt64),
            SyntaxKind.FloatKeyword => new ExpressionTypeInfo(ExpressionTypeInfo.KnownType.Float),
            SyntaxKind.DoubleKeyword => new ExpressionTypeInfo(ExpressionTypeInfo.KnownType.Double),
            SyntaxKind.DecimalKeyword => new ExpressionTypeInfo(ExpressionTypeInfo.KnownType.Decimal),
            SyntaxKind.StringKeyword => new ExpressionTypeInfo(ExpressionTypeInfo.KnownType.String),
            SyntaxKind.ObjectKeyword => new ExpressionTypeInfo(ExpressionTypeInfo.KnownType.Object),
            SyntaxKind.VoidKeyword => new ExpressionTypeInfo(ExpressionTypeInfo.KnownType.Void),
            _ => throw new NotImplementedException()
        };
    }
}