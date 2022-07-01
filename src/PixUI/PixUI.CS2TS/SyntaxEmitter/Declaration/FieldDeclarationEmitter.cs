using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class FieldDeclarationEmitter : SyntaxEmitter<FieldDeclarationSyntax>
    {
        internal static readonly FieldDeclarationEmitter Default = new();

        private FieldDeclarationEmitter() { }

        internal override void Emit(Emitter emitter, FieldDeclarationSyntax node)
        {
            emitter.WriteLeadingTrivia(node);

            emitter.Visit(node.Declaration);

            emitter.VisitToken(node.SemicolonToken);
        }
    }
}