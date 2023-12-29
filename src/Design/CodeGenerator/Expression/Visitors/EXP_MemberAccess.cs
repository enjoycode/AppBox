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

        var owner = Visit(node.Expression);
        if (Expression.IsNull(owner)) //namespace now, eg: System.DateTime
        {
            if (symbol is INamedTypeSymbol namedTypeSymbol)
            {
                return MakeTypeExpression(namedTypeSymbol);
            }
            else
            {
                throw new NotImplementedException();
            }
        }
        else
        {
            return new MemberAccessExpression(owner!, node.Name.Identifier.Text, symbol is IFieldSymbol);
        }
    }
}