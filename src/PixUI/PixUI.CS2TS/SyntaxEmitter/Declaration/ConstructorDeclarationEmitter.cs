using System;
using System.Linq;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class
        ConstructorDeclarationEmitter : SyntaxEmitter<ConstructorDeclarationSyntax>
    {
        internal static readonly ConstructorDeclarationEmitter Default = new();

        private ConstructorDeclarationEmitter() { }

        internal override void Emit(Emitter emitter, ConstructorDeclarationSyntax node)
        {
            //先检查是否有overloads
            var typeDeclaration = (TypeDeclarationSyntax)node.Parent!;
            if (typeDeclaration.Members.OfType<ConstructorDeclarationSyntax>().Count() > 1)
                throw new EmitException("Constructor overloads not supported.", node.Span);

            emitter.WriteLeadingTrivia(node);
            emitter.WriteModifiers(node.Modifiers);
            emitter.Write("constructor");
            emitter.VisitToken(node.ParameterList.OpenParenToken);
            emitter.VisitSeparatedList(node.ParameterList.Parameters);
            emitter.VisitToken(node.ParameterList.CloseParenToken);

            if (node.ExpressionBody != null)
                throw new NotImplementedException();

            // body
            if (node.Initializer != null)
                emitter.WriteTrailingTrivia(node.Initializer);
            emitter.VisitToken(node.Body!.OpenBraceToken);
            emitter.EnterBlock(node.Body);

            if (typeDeclaration is ClassDeclarationSyntax classDeclaration)
                EmitSuperCall(emitter, classDeclaration, node);

            foreach (var statement in node.Body!.Statements)
            {
                emitter.Visit(statement);
            }

            emitter.LeaveBlock(node.Body.Statements.Count > 0 &&
                               node.Body.Statements.Last() is ReturnStatementSyntax);
            emitter.VisitToken(node.Body!.CloseBraceToken);
        }

        private static void EmitSuperCall(Emitter emitter, ClassDeclarationSyntax parent,
            ConstructorDeclarationSyntax node)
        {
            var baseClass = parent.GetBaseType(emitter.SemanticModel);
            if (baseClass == null) return;

            if (node.Initializer != null)
            {
                if (node.Initializer.ThisOrBaseKeyword.Text == "this")
                    throw new NotSupportedException();

                emitter.WriteLeadingWhitespaceOnly(node);
                emitter.Write("\tsuper(");
                emitter.VisitSeparatedList(node.Initializer.ArgumentList.Arguments);
                emitter.Write(");\n");
            }
            else
            {
                emitter.WriteLeadingWhitespaceOnly(node);
                emitter.Write("\tsuper();\n");
            }
        }
    }
}