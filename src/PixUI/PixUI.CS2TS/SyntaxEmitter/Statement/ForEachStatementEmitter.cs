using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class ForEachStatementEmitter : SyntaxEmitter<ForEachStatementSyntax>
    {
        internal static readonly ForEachStatementEmitter Default = new();

        private ForEachStatementEmitter() { }

        internal override void Emit(Emitter emitter, ForEachStatementSyntax node)
        {
            emitter.WriteLeadingTrivia(node);

            emitter.Write("for (const ");
            emitter.Write(node.Identifier.Text);
            emitter.Write(" of ");
            emitter.Visit(node.Expression);
            emitter.VisitToken(node.CloseParenToken);

            emitter.Visit(node.Statement);
        }
    }
}