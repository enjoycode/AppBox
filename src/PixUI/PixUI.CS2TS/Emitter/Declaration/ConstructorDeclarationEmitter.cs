using System;
using System.Linq;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    partial class Emitter
    {
        public override void VisitConstructorDeclaration(ConstructorDeclarationSyntax node)
        {
            //先检查是否有overloads
            var typeDeclaration = (TypeDeclarationSyntax)node.Parent!;
            if (typeDeclaration.Members.OfType<ConstructorDeclarationSyntax>().Count() > 1)
                throw new EmitException("Constructor overloads not supported.", node.Span);

            WriteLeadingTrivia(node);
            WriteModifiers(node.Modifiers);
            Write("constructor");
            VisitToken(node.ParameterList.OpenParenToken);
            VisitSeparatedList(node.ParameterList.Parameters);
            VisitToken(node.ParameterList.CloseParenToken);

            if (node.ExpressionBody != null)
                throw new NotImplementedException();

            // body
            if (node.Initializer != null)
                WriteTrailingTrivia(node.Initializer);
            VisitToken(node.Body!.OpenBraceToken);
            EnterBlock(node.Body);

            if (typeDeclaration is ClassDeclarationSyntax classDeclaration)
                EmitSuperCall(classDeclaration, node);

            foreach (var statement in node.Body!.Statements)
            {
                Visit(statement);
            }

            LeaveBlock(node.Body.Statements.Count > 0 &&
                       node.Body.Statements.Last() is ReturnStatementSyntax);
            VisitToken(node.Body!.CloseBraceToken);
        }

        private void EmitSuperCall(ClassDeclarationSyntax parent, ConstructorDeclarationSyntax node)
        {
            var baseClass = parent.GetBaseType(SemanticModel);
            if (baseClass == null) return;

            if (node.Initializer != null)
            {
                if (node.Initializer.ThisOrBaseKeyword.Text == "this")
                    throw new NotSupportedException();

                WriteLeadingWhitespaceOnly(node);
                Write("\tsuper(");
                VisitSeparatedList(node.Initializer.ArgumentList.Arguments);
                Write(");\n");
            }
            else
            {
                WriteLeadingWhitespaceOnly(node);
                Write("\tsuper();\n");
            }
        }
    }
}