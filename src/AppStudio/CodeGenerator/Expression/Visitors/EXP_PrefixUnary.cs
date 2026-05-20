using System;
using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign.CodeGenerator;

internal partial class ExpressionParser
{
    public override Expression? VisitPrefixUnaryExpression(PrefixUnaryExpressionSyntax node)
    {
        //特殊处理 eg: -1 转换为ConstantExpression
        if (node.Operand is LiteralExpressionSyntax literal && node.OperatorToken.IsKind(SyntaxKind.MinusToken))
        {
            var convertedType = GetConvertedType(node);
            var value = literal.Token.Value;
            return value switch
            {
                short shortValue => new ConstantExpression(-shortValue, convertedType),
                int intValue => new ConstantExpression(-intValue, convertedType),
                long longValue => new ConstantExpression(-longValue, convertedType),
                float floatValue => new ConstantExpression(-floatValue, convertedType),
                double doubleValue => new ConstantExpression(-doubleValue, convertedType),
                decimal decimalValue => new ConstantExpression(-decimalValue, convertedType),
                _ => throw new NotImplementedException()
            };
        }

        throw new NotImplementedException();
    }
}