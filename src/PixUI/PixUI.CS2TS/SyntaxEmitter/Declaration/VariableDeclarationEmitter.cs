using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class VariableDeclarationEmitter : SyntaxEmitter<VariableDeclarationSyntax>
    {
        internal static readonly VariableDeclarationEmitter Default = new();

        private VariableDeclarationEmitter() { }

        internal override void Emit(Emitter emitter, VariableDeclarationSyntax node)
        {
            emitter.WriteLeadingTrivia(node.Type);

            //由于TypeScript不支持多变量定义，暂转换为相同的多个定义
            if (!(node.Parent is FieldDeclarationSyntax | node.Parent is PropertyDeclarationSyntax))
                emitter.Write("let ");

            var multi = false;
            foreach (var variable in node.Variables)
            {
                if (multi)
                {
                    //可能上级为for(declaration内)
                    emitter.Write(node.Parent is ForStatementSyntax ? ", " : "; ");
                }
                else multi = true;

                emitter.Visit(variable);
            }
        }
    }
}