using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    partial class Emitter
    {
        public override void VisitReturnStatement(ReturnStatementSyntax node)
        {
            //dispose block using
            var autoBlock = AutoDisposeBeforeReturn(node);

            VisitToken(node.ReturnKeyword);
            Visit(node.Expression);
            VisitToken(node.SemicolonToken);

            if (autoBlock)
            {
                WriteLeadingWhitespaceOnly(node.Parent!);
                Write("}\n"); 
            }
        }
    }
}