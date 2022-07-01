using System;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class StructDeclarationEmitter : SyntaxEmitter<StructDeclarationSyntax>
    {
        internal static readonly StructDeclarationEmitter Default = new();

        private StructDeclarationEmitter() { }

        internal override void Emit(Emitter emitter, StructDeclarationSyntax node)
        {
            if (node.IsTSType(out _))
                return;

            var export = node.NeedExport(out var isPublic);
            if (isPublic)
                emitter.AddPublicType(node);
            if (export)
                emitter.Write("export ");

            // struct name
            emitter.Write("class "); //转换为class
            emitter.VisitToken(node.Identifier);

            // generic type parameters
            emitter.WriteTypeParameters(node.TypeParameterList, node.ConstraintClauses);

            // extends and implements
            emitter.WriteBaseList(node.BaseList, node);

            // trailing trivia with some case
            if (node.ConstraintClauses.Any())
                emitter.WriteTrailingTrivia(node.ConstraintClauses.Last());

            // members
            emitter.VisitToken(node.OpenBraceToken);

            //如果实现了标为[TSInterfaceOf]的接口，则生成特殊成员
            emitter.TryWriteInterfaceOfMeta(node);

            foreach (var member in node.Members)
            {
                emitter.Visit(member);
            }

            //TODO: 考虑使用Object.create生成不存在的Clone()

            emitter.VisitToken(node.CloseBraceToken);
        }
    }
}