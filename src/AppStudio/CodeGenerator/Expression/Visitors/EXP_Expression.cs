using System.Diagnostics;
using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign.CodeGenerator;

partial class ExpressionParser
{
    public override ParseResult VisitLiteralExpression(LiteralExpressionSyntax node)
    {
        var typeInfo = TryGetTypeInfoWithConverted(node);
        return Expression.Constant(node.Token.Value, typeInfo);
    }

    public override ParseResult VisitThisExpression(ThisExpressionSyntax node)
    {
        //考虑参数是否忽略this
        return ParseResult.None;
    }

    public override ParseResult VisitMemberAccessExpression(MemberAccessExpressionSyntax node)
    {
        var symbol = _semanticModel.GetSymbolInfo(node).Symbol;
        var typeInfo = TryGetTypeInfoWithConverted(node)!.Value;
        var memberName = node.Name.Identifier.Text;

        var owner = node.Expression.Accept(this);
        if (owner.IsNone) //namespace or this now, eg: System.DateTime or this.XXX
        {
            if (symbol is INamedTypeSymbol namedTypeSymbol)
                return MakeTypeInfo(namedTypeSymbol);
            if (symbol is IPropertySymbol or IFieldSymbol)
                return Expression.Parameter(memberName, typeInfo);

            throw new NotImplementedException();
        }

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

    public override ParseResult VisitObjectCreationExpression(ObjectCreationExpressionSyntax node)
    {
        var ctorMethodSymbol = _semanticModel.GetSymbolInfo(node).Symbol;
        var typeSymbol = ctorMethodSymbol!.ContainingType!;

        var typeExp = MakeTypeInfo(typeSymbol);
        Expression[]? args = null;
        if (node.ArgumentList is { Arguments.Count: > 0 })
        {
            args = new Expression[node.ArgumentList.Arguments.Count];
            for (var i = 0; i < node.ArgumentList.Arguments.Count; i++)
            {
                args[i] = node.ArgumentList.Arguments[i].Expression.Accept(this).Expression;
            }
        }

        var convertedType = TryGetConvertedType(node);
        return new NewExpression(typeExp, args, convertedType);
    }

    public override ParseResult VisitAwaitExpression(AwaitExpressionSyntax node)
    {
        var expression = Visit(node.Expression);
        return new AwaitExpression(expression.Expression);
    }

    public override ParseResult VisitBinaryExpression(BinaryExpressionSyntax node)
    {
        var left = node.Left.Accept(this)!;
        var right = node.Right.Accept(this)!;
        var op = GetBinaryOperator(node.OperatorToken);
        var typeInfo = TryGetTypeInfoWithConverted(node);

        return new BinaryExpression(left.Expression, right.Expression, op, typeInfo);
    }

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
                genericTypes[i] = MakeTypeInfo(methodSymbol.TypeArguments[i]);
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