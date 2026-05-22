using System;
using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign.CodeGenerator;

internal partial class ExpressionParser
{
    public override ParseResult VisitPrefixUnaryExpression(PrefixUnaryExpressionSyntax node)
    {
        //特殊处理 eg: -1 转换为ConstantExpression
        if (node.Operand is LiteralExpressionSyntax literal && node.OperatorToken.IsKind(SyntaxKind.MinusToken))
        {
            var typeInfo = TryGetTypeInfoWithConverted(node);
            var value = literal.Token.Value;
            return value switch
            {
                short shortValue => Expression.Constant(-shortValue, typeInfo),
                int intValue => Expression.Constant(-intValue, typeInfo),
                long longValue => Expression.Constant(-longValue, typeInfo),
                float floatValue => Expression.Constant(-floatValue, typeInfo),
                double doubleValue => Expression.Constant(-doubleValue, typeInfo),
                decimal decimalValue => Expression.Constant(-decimalValue, typeInfo),
                _ => throw new NotImplementedException()
            };
        }

        throw new NotImplementedException();
    }
}