using System;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    partial class Emitter
    {
        public override void VisitIsPatternExpression(IsPatternExpressionSyntax node)
        {
            if (node.Parent is not IfStatementSyntax)
                throw new NotSupportedException(node.ToString());

            //暂在这里预先处理 obj is null以及obj is not null
            if (node.Pattern is ConstantPatternSyntax constant1 &&
                constant1.Expression.Kind() == SyntaxKind.NullLiteralExpression)
            {
                Visit(node.Expression);
                Write(" == null");
                return;
            }

            if (node.Pattern is UnaryPatternSyntax notPattern &&
                notPattern.Pattern is ConstantPatternSyntax constant2 &&
                constant2.Expression.Kind() == SyntaxKind.NullLiteralExpression)
            {
                Visit(node.Expression);
                Write(" != null");
                return;
            }

            if (node.Pattern is not DeclarationPatternSyntax declarationPattern)
                throw new NotSupportedException(node.ToString());

            WriteIsExpression(node.Expression, declarationPattern.Type);

            InjectIsPatternExpression = node;
        }
    }
}