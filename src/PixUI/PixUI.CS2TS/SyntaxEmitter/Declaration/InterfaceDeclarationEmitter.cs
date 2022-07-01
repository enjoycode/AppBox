using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class InterfaceDeclarationEmitter : SyntaxEmitter<InterfaceDeclarationSyntax>
    {
        internal static readonly InterfaceDeclarationEmitter Default = new();

        private InterfaceDeclarationEmitter() { }

        internal override void Emit(Emitter emitter, InterfaceDeclarationSyntax node)
        {
            if (emitter.ToJavaScript) return;

            var export = node.NeedExport(out var isPublic);
            if (isPublic)
                emitter.AddPublicType(node);
            if (export)
                emitter.Write("export ");

            // interface name
            emitter.Write("interface ");
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

            foreach (var member in node.Members)
            {
                emitter.Visit(member);
            }

            emitter.VisitToken(node.CloseBraceToken);

            //如果有[TSInterfaceOf]特性，生成相关的代码
            TryEmitInterfaceOf(emitter, node);
        }

        private static void TryEmitInterfaceOf(Emitter emitter, InterfaceDeclarationSyntax node)
        {
            if (!node.IsTSInterfaceOf()) return;

            emitter.Write("export function IsInterfaceOf");
            emitter.Write(node.Identifier.Text);
            emitter.Write("(obj: any): obj is ");
            emitter.Write(node.Identifier.Text);
            emitter.Write(" {\n");

            emitter.Write(
                "\treturn typeof obj === \"object\" && obj !== null && !Array.isArray(obj) && ");
            emitter.Write("'$meta_");

            var symbol = emitter.SemanticModel.GetDeclaredSymbol(node);
            var rootNamespace = symbol!.GetRootNamespace();
            if (rootNamespace != null)
            {
                emitter.AddUsedModule(rootNamespace.Name);
                emitter.Write(rootNamespace.Name);
                emitter.Write('_');
            }

            emitter.Write(node.Identifier.Text);
            emitter.Write("' in obj.constructor;\n}\n");
        }
    }
}