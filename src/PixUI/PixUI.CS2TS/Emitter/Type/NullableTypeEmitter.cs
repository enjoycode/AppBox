using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    partial class Emitter
    {
        public override void VisitNullableType(NullableTypeSyntax node)
        {
            Write("Nullable<");
            DisableVisitLeadingTrivia();
            Visit(node.ElementType);
            EnableVisitLeadingTrivia();
            Write('>');

            WriteTrailingTrivia(node);
        }
    }
}