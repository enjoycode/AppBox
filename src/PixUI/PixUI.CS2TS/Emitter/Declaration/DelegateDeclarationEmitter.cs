using System.Linq;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    partial class Emitter
    {
        public override void VisitDelegateDeclaration(DelegateDeclarationSyntax node)
        {
            if (node.IsTSType(out _))
                return;

            WriteLeadingTrivia(node);

            var needExport = node.Modifiers.Any(m =>
                m.Kind() == SyntaxKind.PublicKeyword || m.Kind() == SyntaxKind.InternalKeyword);
            if (needExport)
                Write("export ");

            Write("type ");
            Write(node.Identifier.Text);
            if (node.TypeParameterList != null)
            {
                Write('<');
                VisitSeparatedList(node.TypeParameterList.Parameters);
                Write('>');
            }

            Write(" = ");

            Write('(');
            VisitSeparatedList(node.ParameterList.Parameters);
            Write(") => ");
            Visit(node.ReturnType);

            VisitToken(node.SemicolonToken);
        }
    }
}