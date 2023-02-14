using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    partial class Emitter
    {
        public override void VisitClassDeclaration(ClassDeclarationSyntax node)
        {
            if (node.IsTSType(out _))
                return;

            WriteLeadingTrivia(node);

            var export = node.NeedExport(out var isPublic);
            if (isPublic)
                AddPublicType(node);
            if (export)
                Write("export ");

            // abstract
            if (node.HasAbstractModifier())
                Write("abstract ");

            // class name, 注意范型类型加入范型参数个数
            VisitToken(node.Keyword);
            if (node.TypeParameterList != null && node.TypeParameterList.Parameters.Count > 0)
            {
                VisitLeadingTrivia(node.Identifier);
                Write(node.Identifier.Text);
                Write(node.TypeParameterList.Parameters.Count.ToString());
                VisitTrailingTrivia(node.Identifier);
            }
            else
            {
                VisitToken(node.Identifier);
            }

            // try write generic type parameters
            WriteTypeParameters(node.TypeParameterList, node.ConstraintClauses);

            // extends and implements
            WriteBaseList(node.BaseList, node);

            // trailing trivia with some case
            if (node.ConstraintClauses.Any())
                WriteTrailingTrivia(node.ConstraintClauses.Last());

            // members
            VisitToken(node.OpenBraceToken);

            //如果实现了标为[TSInterfaceOf]的接口，则生成特殊成员
            TryWriteInterfaceOfMeta(node);

            foreach (var member in node.Members)
            {
                Visit(member);
            }

            VisitToken(node.CloseBraceToken);
        }
    }
}