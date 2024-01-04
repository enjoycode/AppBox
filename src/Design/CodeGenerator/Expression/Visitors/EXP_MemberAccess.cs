using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign.CodeGenerator;

internal partial class ExpressionParser
{
    public override Expression? VisitMemberAccessExpression(MemberAccessExpressionSyntax node)
    {
        var symbol = _semanticModel.GetSymbolInfo(node).Symbol;

        var owner = node.Expression.Accept(this);
        if (Expression.IsNull(owner)) //namespace now, eg: System.DateTime
        {
            if (symbol is INamedTypeSymbol namedTypeSymbol)
            {
                return MakeTypeExpression(namedTypeSymbol);
            }

            throw new NotImplementedException();
        }

        var convertedType = GetConvertedType(node);
        return new MemberAccessExpression(owner!, node.Name.Identifier.Text, symbol is IFieldSymbol, convertedType);
    }
}