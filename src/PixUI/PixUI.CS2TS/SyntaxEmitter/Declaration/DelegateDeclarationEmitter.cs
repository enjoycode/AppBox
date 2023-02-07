using System.Linq;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class DelegateDeclarationEmitter : SyntaxEmitter<DelegateDeclarationSyntax>
    {
        internal static readonly DelegateDeclarationEmitter Default = new();

        private DelegateDeclarationEmitter() { }

        internal override void Emit(Emitter emitter, DelegateDeclarationSyntax node)
        {
            if (node.IsTSType(out _))
                return; 
            
            emitter.WriteLeadingTrivia(node);
            
            var needExport = node.Modifiers.Any(m =>
                m.Kind() == SyntaxKind.PublicKeyword || m.Kind() == SyntaxKind.InternalKeyword);
            if (needExport)
                emitter.Write("export ");

            emitter.Write("type ");
            emitter.Write(node.Identifier.Text);
            if (node.TypeParameterList != null)
            {
                emitter.Write('<');
                emitter.VisitSeparatedList(node.TypeParameterList.Parameters);
                emitter.Write('>');
            }

            emitter.Write(" = ");

            emitter.Write('(');
            emitter.VisitSeparatedList(node.ParameterList.Parameters);
            emitter.Write(") => ");
            emitter.Visit(node.ReturnType);

            emitter.VisitToken(node.SemicolonToken);
        }
    }
}