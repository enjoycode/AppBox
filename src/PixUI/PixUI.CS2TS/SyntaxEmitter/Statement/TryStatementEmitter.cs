using System;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal static class TryStatementEmitter
    {
        public static void Emit(Emitter emitter, TryStatementSyntax node)
        {
            if (node.Catches.Count > 1)
                throw new NotSupportedException("Try statement can only has one catch cause");
            if (node.Catches.Count == 1)
            {
                var catchClauseType = node.Catches[0].Declaration!.Type.ToString();
                if (catchClauseType != "Exception" && catchClauseType != "System.Exception")
                    throw new NotSupportedException("CatchClause only accept System.Exception");
            }

            emitter.VisitToken(node.TryKeyword);
            emitter.Visit(node.Block);
            if (node.Catches.Count == 1)
            {
                var catchClause = node.Catches[0];
                var catchDeclaration = catchClause.Declaration!;
                emitter.VisitToken(catchClause.CatchKeyword);
                emitter.VisitToken(catchDeclaration.OpenParenToken);
                emitter.Write(catchDeclaration.Identifier.Text);
                if (!emitter.ToJavaScript)
                    emitter.Write(": any");
                emitter.VisitToken(catchDeclaration.CloseParenToken);

                emitter.Visit(catchClause.Block);
            }

            emitter.Visit(node.Finally);
        }
    }
}