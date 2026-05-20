using AppBoxCore;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign.CodeGenerator;

internal partial class ExpressionParser
{
    public override Expression? VisitLiteralExpression(LiteralExpressionSyntax node)
    {
        var convertedType = GetConvertedType(node);
        return ConstantExpression.From(node.Token.Value, convertedType);
    }
}