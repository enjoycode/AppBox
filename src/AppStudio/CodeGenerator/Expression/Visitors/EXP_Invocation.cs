using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign.CodeGenerator;

internal partial class ExpressionParser
{
    public override ParseResult VisitInvocationExpression(InvocationExpressionSyntax node)
    {
        Expression[]? args = null;
        if (node.ArgumentList.Arguments.Count > 0)
        {
            args = new Expression[node.ArgumentList.Arguments.Count];
            for (var i = 0; i < args.Length; i++)
            {
                //TODO: check not supported ref and out
                args[i] = node.ArgumentList.Arguments[i].Expression.Accept(this).Expression;
            }
        }

        ExpressionTypeInfo[]? genericTypes = null;
        var methodSymbol = (IMethodSymbol)_semanticModel.GetSymbolInfo(node).Symbol!;
        if (methodSymbol.IsGenericMethod)
        {
            genericTypes = new ExpressionTypeInfo[methodSymbol.TypeArguments.Length];
            for (var i = 0; i < genericTypes.Length; i++)
            {
                genericTypes[i] = MakeTypeInfo((INamedTypeSymbol)methodSymbol.TypeArguments[i]);
            }
        }

        var typeInfo = TryGetTypeInfoWithConverted(node)!.Value;
        // eg: aa.Method(bb,cc) or object.Equals(aa,bb)
        if (node.Expression is MemberAccessExpressionSyntax memberAccess)
        {
            var res = memberAccess.Expression.Accept(this);
            var methodName = memberAccess.Name.Identifier.Text;
            return res.IsExpression
                ? Expression.InstanceCall(res.Expression, methodName, typeInfo, args, genericTypes)
                : Expression.StaticCall(res.TypeInfo, methodName, typeInfo, args, genericTypes);
        }

        // eg: Equals(aa, bb)
        if (node.Expression is IdentifierNameSyntax identifierName)
        {
            var symbol = _semanticModel.GetSymbolInfo(identifierName).Symbol;
            var staticType = MakeTypeInfo(symbol!.ContainingType);
            var methodName = identifierName.Identifier.Text;
            return Expression.StaticCall(staticType, methodName, typeInfo, args, genericTypes);
        }

        throw new NotImplementedException();
    }
}