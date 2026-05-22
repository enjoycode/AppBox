using AppBoxCore;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign.CodeGenerator;

partial class ExpressionParser
{
    public override ParseResult VisitPredefinedType(PredefinedTypeSyntax node)
    {
        return node.Keyword.Kind() switch
        {
            SyntaxKind.StringKeyword => new ExpressionTypeInfo("string"),
            SyntaxKind.CharKeyword => new ExpressionTypeInfo("char"),
            SyntaxKind.ByteKeyword => new ExpressionTypeInfo("byte"),
            SyntaxKind.SByteKeyword => new ExpressionTypeInfo("sbyte"),
            SyntaxKind.ShortKeyword => new ExpressionTypeInfo("short"),
            SyntaxKind.UShortKeyword => new ExpressionTypeInfo("ushort"),
            SyntaxKind.IntKeyword => new ExpressionTypeInfo("int"),
            SyntaxKind.UIntKeyword => new ExpressionTypeInfo("uint"),
            SyntaxKind.FloatKeyword => new ExpressionTypeInfo("float"),
            SyntaxKind.DoubleKeyword => new ExpressionTypeInfo("double"),
            SyntaxKind.LongKeyword => new ExpressionTypeInfo("long"),
            SyntaxKind.ULongKeyword => new ExpressionTypeInfo("ulong"),
            SyntaxKind.BoolKeyword => new ExpressionTypeInfo("bool"),
            SyntaxKind.ObjectKeyword => new ExpressionTypeInfo("object"),
            _ => throw new NotImplementedException()
        };
    }
}