using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

internal partial class ServiceCodeGenerator
{
    public override SyntaxNode? VisitBinaryExpression(BinaryExpressionSyntax node)
    {
        if (_queryMethodCtx.HasAny && _queryMethodCtx.Current.InLambdaExpression)
        {
            //如果在条件表达式内将&&转为&, ||转为|
            if (node.OperatorToken.IsKind(SyntaxKind.AmpersandAmpersandToken)) //&& -> &
            {
                var left = (ExpressionSyntax)node.Left.Accept(this)!.WithTriviaFrom(node.Left);
                var right = (ExpressionSyntax)node.Right.Accept(this)!.WithTriviaFrom(node.Right);
                return SyntaxFactory.BinaryExpression(SyntaxKind.BitwiseAndExpression, left, right)
                    .WithTriviaFrom(node);
            }

            if (node.OperatorToken.IsKind(SyntaxKind.BarBarToken)) //|| -> |
            {
                var left = (ExpressionSyntax)node.Left.Accept(this)!;
                var right = (ExpressionSyntax)node.Right.Accept(this)!;
                return SyntaxFactory.BinaryExpression(SyntaxKind.BitwiseOrExpression, left, right)
                    .WithTriviaFrom(node);
            }

            //TODO:转换其他Bitwise操作符
            if (node.OperatorToken.IsKind(SyntaxKind.AmpersandToken)
                || node.OperatorToken.IsKind(SyntaxKind.BarToken))
            {
                throw new NotImplementedException("Binary & and | operator not implemented.");
            }
        }

        return base.VisitBinaryExpression(node);
    }
}