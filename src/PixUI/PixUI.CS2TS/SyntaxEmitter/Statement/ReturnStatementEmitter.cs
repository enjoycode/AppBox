using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class ReturnStatementEmitter : SyntaxEmitter<ReturnStatementSyntax>
    {
        internal static readonly ReturnStatementEmitter Default = new();

        private ReturnStatementEmitter() { }

        internal override void Emit(Emitter emitter, ReturnStatementSyntax node)
        {
            //dispose block using
            var autoBlock = emitter.AutoDisposeBeforeReturn(node);

            emitter.VisitToken(node.ReturnKeyword);
            emitter.Visit(node.Expression);
            emitter.VisitToken(node.SemicolonToken);

            if (autoBlock)
            {
                emitter.WriteLeadingWhitespaceOnly(node.Parent!);
                emitter.Write("}\n"); 
            }
        }
    }
}