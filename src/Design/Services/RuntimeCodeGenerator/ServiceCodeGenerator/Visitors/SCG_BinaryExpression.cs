using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

internal partial class ServiceCodeGenerator
{
    public override SyntaxNode? VisitBinaryExpression(BinaryExpressionSyntax node)
    {
        if (queryMethodCtx.HasAny && queryMethodCtx.Current.InLambdaExpression)
        {
            //如果在条件表达式内将&&转为&, ||转为|
            if (node.OperatorToken.Kind() == SyntaxKind.AmpersandAmpersandToken) //&& -> &
            {
                var left = (ExpressionSyntax)node.Left.Accept(this)!.WithTriviaFrom(node.Left);
                var right = (ExpressionSyntax)node.Right.Accept(this)!.WithTriviaFrom(node.Right);
                return SyntaxFactory.BinaryExpression(SyntaxKind.BitwiseAndExpression, left, right)
                    .WithTriviaFrom(node);
            }

            if (node.OperatorToken.Kind() == SyntaxKind.BarBarToken) //|| -> |
            {
                var left = (ExpressionSyntax)node.Left.Accept(this)!;
                var right = (ExpressionSyntax)node.Right.Accept(this)!;
                return SyntaxFactory.BinaryExpression(SyntaxKind.BitwiseOrExpression, left, right)
                    .WithTriviaFrom(node);
            }

            //TODO:转换其他Bitwise操作符
            if (node.OperatorToken.Kind() == SyntaxKind.AmpersandToken
                || node.OperatorToken.Kind() == SyntaxKind.BarToken)
            {
                throw new NotImplementedException("Binary & and | operator not implemented.");
            }
        }

        return base.VisitBinaryExpression(node);
    }
}