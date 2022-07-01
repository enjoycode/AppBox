using System;
using System.Linq;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class IfStatementEmitter : SyntaxEmitter<IfStatementSyntax>
    {
        internal static readonly IfStatementEmitter Default = new();

        private IfStatementEmitter() { }

        internal override void Emit(Emitter emitter, IfStatementSyntax node)
        {
            // //先判断是否有Pattern
            // var hasPattern = node.DescendantNodes()
            //     .Any(t => t is IsPatternExpressionSyntax);
            // if (hasPattern)
            // {
            //     EmitToPattern(emitter, node);
            //     return;
            // }

            emitter.VisitToken(node.IfKeyword);
            emitter.VisitToken(node.OpenParenToken);
            emitter.Visit(node.Condition);
            emitter.VisitToken(node.CloseParenToken);

            if (emitter.InjectIsPatternExpression != null)
            {
                var inject = GetInject(emitter); //eg: const dog = obj;

                if (node.Statement is BlockSyntax block)
                {
                    new BlockEmitter(inject).Emit(emitter, block);
                }
                else
                {
                    emitter.WriteLeadingWhitespaceOnly(node);
                    emitter.Write("{\n");
                    emitter.WriteLeadingWhitespaceOnly(node);
                    emitter.Write('\t');
                    emitter.Write(inject);
                    emitter.Write('\n');
                    emitter.Visit(node.Statement);
                    emitter.WriteLeadingWhitespaceOnly(node);
                    emitter.Write("}\n");
                    
                    emitter.InjectIsPatternExpression = null; //must reset it
                }
            }
            else
            {
                emitter.Visit(node.Statement);
            }

            emitter.Visit(node.Else);
        }

        private static string GetInject(Emitter emitter)
        {
            emitter.UseTempOutput();

            var declaration = (DeclarationPatternSyntax)emitter.InjectIsPatternExpression!.Pattern;
            emitter.Write("const ");
            emitter.Visit(declaration.Designation);
            emitter.Write(" = ");
            emitter.Visit(emitter.InjectIsPatternExpression!.Expression);
            emitter.Write(';');

            return emitter.GetTempOutput();
        }
    }
}