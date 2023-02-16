using System;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    partial class Emitter
    {
        public override void VisitIsPatternExpression(IsPatternExpressionSyntax node)
        {
            if (node.Parent is not IfStatementSyntax)
                throw new NotSupportedException(node.ToString());
            if (node.Pattern is not DeclarationPatternSyntax declarationPattern)
                throw new NotSupportedException(node.ToString());

            WriteIsExpression(node.Expression, declarationPattern.Type);

            InjectIsPatternExpression = node;
        }
    }
}