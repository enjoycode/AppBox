using AppBoxCore;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign.CodeGenerator;

internal partial class ExpressionParser
{
    public override Expression? VisitPredefinedType(PredefinedTypeSyntax node)
    {
        return node.Keyword.Kind() switch
        {
            SyntaxKind.StringKeyword => new TypeExpression("string"),
            SyntaxKind.CharKeyword => new TypeExpression("char"),
            SyntaxKind.ByteKeyword => new TypeExpression("byte"),
            SyntaxKind.SByteKeyword => new TypeExpression("sbyte"),
            SyntaxKind.ShortKeyword => new TypeExpression("short"),
            SyntaxKind.UShortKeyword => new TypeExpression("ushort"),
            SyntaxKind.IntKeyword => new TypeExpression("int"),
            SyntaxKind.UIntKeyword => new TypeExpression("uint"),
            SyntaxKind.FloatKeyword => new TypeExpression("float"),
            SyntaxKind.DoubleKeyword => new TypeExpression("double"),
            SyntaxKind.LongKeyword => new TypeExpression("long"),
            SyntaxKind.ULongKeyword => new TypeExpression("ulong"),
            SyntaxKind.BoolKeyword => new TypeExpression("bool"),
            SyntaxKind.ObjectKeyword => new TypeExpression("object"),
            _ => throw new NotImplementedException()
        };
    }
}