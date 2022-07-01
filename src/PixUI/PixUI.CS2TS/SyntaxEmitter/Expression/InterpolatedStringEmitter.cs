using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class
        InterpolatedStringEmitter : SyntaxEmitter<InterpolatedStringExpressionSyntax>
    {
        internal static readonly InterpolatedStringEmitter Default = new();

        private InterpolatedStringEmitter() { }
        
        internal override void Emit(Emitter emitter, InterpolatedStringExpressionSyntax node)
        {
            emitter.WriteLeadingTrivia(node);
            emitter.Write('`');

            foreach (var item in node.Contents)
            {
                emitter.Visit(item);
            }

            emitter.Write('`');
            emitter.WriteTrailingTrivia(node);
        }
    }
}