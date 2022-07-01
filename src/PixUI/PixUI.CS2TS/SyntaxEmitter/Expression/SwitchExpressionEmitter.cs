using System;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class SwitchExpressionEmitter : SyntaxEmitter<SwitchExpressionSyntax>
    {
        internal static readonly SwitchExpressionEmitter Default = new();

        private SwitchExpressionEmitter() { }

        internal override void Emit(Emitter emitter, SwitchExpressionSyntax node)
        {
            //emitter.WriteLeadingTrivia(node.GoverningExpression);

            emitter.Write("match(");
            emitter.Visit(node.GoverningExpression);
            emitter.Write(")\n");

            foreach (var arm in node.Arms)
            {
                if (arm.WhenClause != null)
                    throw new NotImplementedException("SwitchExpression with when");

                emitter.WriteLeadingWhitespaceOnly(arm);
                if (arm.Pattern is DiscardPatternSyntax)
                {
                    emitter.Write(".otherwise(() => ");
                    emitter.DisableVisitTrailingTrivia();
                    emitter.Visit(arm.Expression);
                    emitter.EnableVisitTrailingTrivia();
                    emitter.Write(")");
                }
                else if (arm.Pattern is ConstantPatternSyntax constant)
                {
                    emitter.Write(".with(");
                    emitter.Visit(constant.Expression);
                    emitter.Write(", () => ");
                    emitter.Visit(arm.Expression);
                    emitter.Write(")\n");
                }
                else
                {
                    throw new NotImplementedException(
                        $"SwitchExpression with {arm.Pattern.GetType()}");
                }
            }
        }
    }
}