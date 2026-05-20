using System;
using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign.CodeGenerator;

internal partial class ExpressionParser
{
    public override Expression? VisitInvocationExpression(InvocationExpressionSyntax node)
    {
        var convertedType = GetConvertedType(node);
        Expression[]? args = null;
        if (node.ArgumentList.Arguments.Count > 0)
        {
            args = new Expression[node.ArgumentList.Arguments.Count];
            for (var i = 0; i < args.Length; i++)
            {
                //TODO: check not supported ref and out
                args[i] = node.ArgumentList.Arguments[i].Expression.Accept(this)!;
            }
        }

        TypeExpression[]? genericTypes = null;
        var methodSymbol = (IMethodSymbol)_semanticModel.GetSymbolInfo(node).Symbol!;
        if (methodSymbol.IsGenericMethod)
        {
            genericTypes = new TypeExpression[methodSymbol.TypeArguments.Length];
            for (var i = 0; i < genericTypes.Length; i++)
            {
                genericTypes[i] = MakeTypeExpression((INamedTypeSymbol)methodSymbol.TypeArguments[i]);
            }
        }

        // eg: aa.Method(bb,cc)
        if (node.Expression is MemberAccessExpressionSyntax memberAccess)
        {
            var exp = memberAccess.Expression.Accept(this);
            var methodName = memberAccess.Name.Identifier.Text;
            return new MethodCallExpression(exp!, methodName, genericTypes, args, convertedType);
        }

        // eg: Equals(aa, bb)
        if (node.Expression is IdentifierNameSyntax identifierName)
        {
            var symbol = _semanticModel.GetSymbolInfo(identifierName).Symbol;
            var type = MakeTypeExpression(symbol!.ContainingType);
            var methodName = identifierName.Identifier.Text;
            return new MethodCallExpression(type, methodName, genericTypes, args, convertedType);
        }

        throw new NotImplementedException();
    }
}