using System;
using System.Linq;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class SwitchStatementEmitter : SyntaxEmitter<SwitchStatementSyntax>
    {
        internal static readonly SwitchStatementEmitter Default = new();

        private SwitchStatementEmitter() { }

        internal override void Emit(Emitter emitter, SwitchStatementSyntax node)
        {
            var hasPattern = node.Sections
                .SelectMany(t => t.Labels)
                .Any(l => l is CasePatternSwitchLabelSyntax);
            if (hasPattern)
            {
                EmitToPattern(emitter, node);
                return;
            }

            emitter.VisitToken(node.SwitchKeyword);
            emitter.VisitToken(node.OpenParenToken);
            emitter.Visit(node.Expression);
            emitter.VisitToken(node.CloseParenToken);
            emitter.VisitToken(node.OpenBraceToken);

            foreach (var section in node.Sections)
            {
                emitter.Visit(section);
            }

            emitter.VisitToken(node.CloseBraceToken);
        }

        private static void EmitToPattern(Emitter emitter, SwitchStatementSyntax node)
        {
            emitter.WriteLeadingTrivia(node);
            
            emitter.Write("match(");
            emitter.Visit(node.Expression);
            emitter.Write(")\n");

            var hasDefault = false;
            foreach (var section in node.Sections)
            {
                if (section.Labels.Count > 1)
                    throw new NotImplementedException("SwitchPattern with multi label");
                
                emitter.WriteLeadingWhitespaceOnly(node);
                emitter.Write('\t');

                var label = section.Labels[0];
                if (label is CasePatternSwitchLabelSyntax casePattern)
                {
                    if (casePattern.Pattern is not DeclarationPatternSyntax declaration)
                        throw new NotImplementedException();
                    if (casePattern.WhenClause != null)
                        throw new NotImplementedException();

                    //使用.when不使用.with(instanceOf(XXX))是方便重用WriteIsExpression逻辑
                    emitter.Write(".when(t => ");
                    emitter.NeedGenericTypeArguments = false;
                    emitter.WriteIsExpression("t", declaration.Type);
                    emitter.NeedGenericTypeArguments = true;
                    emitter.Write(", (");
                    emitter.Visit(declaration.Designation);
                    emitter.Write(": ");
                    emitter.Visit(declaration.Type);
                    emitter.Write(") => {");
                    EmitSectionStatements(emitter, section);
                    emitter.Write("})\n");
                }
                else if (label is CaseSwitchLabelSyntax caseNormal)
                {
                    //TODO:
                }
                else if (label is DefaultSwitchLabelSyntax defaultLabel)
                {
                    hasDefault = true;
                    emitter.Write(".otherwise(() => {");
                    EmitSectionStatements(emitter, section);
                    emitter.Write("})\n");
                }
                else
                {
                    throw new NotSupportedException($"Switch with label: {label.GetType()}");
                }
            }
        }

        private static void EmitSectionStatements(Emitter emitter, SwitchSectionSyntax section)
        {
            for (var i = 0; i < section.Statements.Count; i++)
            {
                var statement = section.Statements[i];

                if (i == section.Statements.Count - 1 && statement is BreakStatementSyntax)
                    break;

                if (i == 0 && statement is BlockSyntax block)
                {
                    new BlockEmitter(true).Emit(emitter, block);
                }
                else
                {
                    emitter.Visit(statement);
                }
            }
        }
    }
}