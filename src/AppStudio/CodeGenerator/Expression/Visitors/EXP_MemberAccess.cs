using System.Diagnostics;
using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign.CodeGenerator;

internal partial class ExpressionParser
{
    public override ParseResult VisitMemberAccessExpression(MemberAccessExpressionSyntax node)
    {
        var symbol = _semanticModel.GetSymbolInfo(node).Symbol;

        var owner = node.Expression.Accept(this);
        if (owner.IsNone) //namespace now, eg: System.DateTime
        {
            if (symbol is INamedTypeSymbol namedTypeSymbol)
                return MakeTypeInfo(namedTypeSymbol);

            throw new NotImplementedException();
        }

        var typeInfo = TryGetTypeInfoWithConverted(node)!.Value;
        var memberName = node.Name.Identifier.Text;
        var isField = symbol is IFieldSymbol;
        if (owner.IsTypeInfo)
        {
            return isField
                ? Expression.StaticField(owner.TypeInfo, memberName, typeInfo)
                : Expression.StaticProperty(owner.TypeInfo, memberName, typeInfo);
        }

        Debug.Assert(owner.IsExpression);
        return isField
            ? Expression.InstanceField(owner.Expression, memberName, typeInfo)
            : Expression.InstanceProperty(owner.Expression, memberName, typeInfo);
    }
}