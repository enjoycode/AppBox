using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class
        LocalDeclarationStatementEmitter : SyntaxEmitter<LocalDeclarationStatementSyntax>
    {
        internal static readonly LocalDeclarationStatementEmitter Default = new();

        private LocalDeclarationStatementEmitter() { }

        internal override void Emit(Emitter emitter, LocalDeclarationStatementSyntax node)
        {
            if (node.UsingKeyword.Value != null)
            {
                emitter.VisitLeadingTrivia(node.UsingKeyword);
                //add using resource to current block
                emitter.AddUsingResourceToBlock(node.Declaration);
            }
            
            emitter.Visit(node.Declaration);
            emitter.VisitToken(node.SemicolonToken);
        }
    }
}