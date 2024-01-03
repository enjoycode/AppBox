using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign.CodeGenerator;

internal partial class ExpressionParser
{
    public override Expression? VisitLiteralExpression(LiteralExpressionSyntax node)
    {
        var typeInfo = _semanticModel.GetTypeInfo(node);
        TypeExpression? convertedType = null;
        if (!SymbolEqualityComparer.Default.Equals(typeInfo.Type, typeInfo.ConvertedType))
            convertedType = MakeTypeExpression((INamedTypeSymbol)typeInfo.ConvertedType!);

        return new ConstantExpression(node.Token.Value, convertedType);
    }
}