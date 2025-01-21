using System;
using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign.CodeGenerator;

internal partial class ExpressionParser
{
    public override Expression? VisitBinaryExpression(BinaryExpressionSyntax node)
    {
        var left = node.Left.Accept(this)!;
        var right = node.Right.Accept(this)!;
        var op = GetOperator(node.OperatorToken);
        var convertedType = GetConvertedType(node);

        return new BinaryExpression(left, right, op, convertedType);
    }

    private static BinaryOperatorType GetOperator(SyntaxToken token) => token.Kind() switch
    {
        SyntaxKind.PlusToken => BinaryOperatorType.Plus,
        SyntaxKind.MinusToken => BinaryOperatorType.Minus,
        SyntaxKind.AsteriskToken => BinaryOperatorType.Multiply,
        SyntaxKind.SlashToken => BinaryOperatorType.Divide,
        SyntaxKind.EqualsEqualsToken => BinaryOperatorType.Equal,
        SyntaxKind.ExclamationEqualsToken => BinaryOperatorType.NotEqual,
        SyntaxKind.GreaterThanToken => BinaryOperatorType.Greater,
        SyntaxKind.GreaterThanEqualsToken => BinaryOperatorType.GreaterOrEqual,
        SyntaxKind.LessThanToken => BinaryOperatorType.Less,
        SyntaxKind.LessThanEqualsToken => BinaryOperatorType.LessOrEqual,
        _ => throw new NotImplementedException($"Binary Operator: {token}")
    };
}