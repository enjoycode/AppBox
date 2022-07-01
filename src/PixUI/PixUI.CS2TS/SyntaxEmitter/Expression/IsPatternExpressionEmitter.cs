using System;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class IsPatternExpressionEmitter : SyntaxEmitter<IsPatternExpressionSyntax>
    {
        internal static readonly IsPatternExpressionEmitter Default = new();

        private IsPatternExpressionEmitter() { }

        internal override void Emit(Emitter emitter, IsPatternExpressionSyntax node)
        {
            if (node.Parent is not IfStatementSyntax)
                throw new NotSupportedException(node.ToString());
            if (node.Pattern is not DeclarationPatternSyntax declarationPattern)
                throw new NotSupportedException(node.ToString());

            emitter.NeedGenericTypeArguments = false;
            emitter.WriteIsExpression(node.Expression, declarationPattern.Type);
            emitter.NeedGenericTypeArguments = true;

            emitter.InjectIsPatternExpression = node;
        }
    }
}