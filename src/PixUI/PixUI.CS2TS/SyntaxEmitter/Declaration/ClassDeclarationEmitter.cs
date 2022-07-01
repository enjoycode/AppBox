using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class ClassDeclarationEmitter : SyntaxEmitter<ClassDeclarationSyntax>
    {
        internal static readonly ClassDeclarationEmitter Default = new();

        private ClassDeclarationEmitter() { }

        internal override void Emit(Emitter emitter, ClassDeclarationSyntax node)
        {
            if (node.IsTSType(out _))
                return;

            if (node.HasLeadingTrivia)
            {
               var leadingTrivia = node.GetLeadingTrivia();
               emitter.Write(leadingTrivia.ToString());
            }

            var isGenericTypeOverloads = node.IsGenericOverloadsType(); //TODO: remove
            if (isGenericTypeOverloads)
                emitter.Translator.AddGenericTypeOverloads(node);

            var export = node.NeedExport(out var isPublic);
            if (isPublic && !isGenericTypeOverloads)
                emitter.AddPublicType(node);
            if (export)
                emitter.Write("export ");

            // abstract
            if (node.HasAbstractModifier())
                emitter.Write("abstract ");

            // class name
            emitter.VisitToken(node.Keyword);
            if (isGenericTypeOverloads)
            {
                emitter.VisitLeadingTrivia(node.Identifier);
                emitter.Write(node.Identifier.Text);
                emitter.Write(node.TypeParameterList == null
                    ? "0"
                    : node.TypeParameterList.Parameters.Count.ToString());
                emitter.VisitTrailingTrivia(node.Identifier);
            }
            else
            {
                emitter.VisitToken(node.Identifier);
            }

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
            
            //尝试生成初始化器方法
            emitter.TryWriteInitializer(node);

            emitter.VisitToken(node.CloseBraceToken);
        }
    }
}