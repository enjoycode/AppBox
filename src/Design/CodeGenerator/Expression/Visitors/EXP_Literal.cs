using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign.CodeGenerator;

internal partial class ExpressionParser
{
    public override Expression? VisitLiteralExpression(LiteralExpressionSyntax node)
    {
        var convertedType = GetConvertedType(node);
        return new ConstantExpression(node.Token.Value, convertedType);
    }
}