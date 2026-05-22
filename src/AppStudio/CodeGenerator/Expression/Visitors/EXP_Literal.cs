using AppBoxCore;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign.CodeGenerator;

internal partial class ExpressionParser
{
    public override ParseResult VisitLiteralExpression(LiteralExpressionSyntax node)
    {
        var typeInfo = TryGetTypeInfoWithConverted(node);
        return Expression.Constant(node.Token.Value, typeInfo);
    }
}