using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class QualifiedNameEmitter : SyntaxEmitter<QualifiedNameSyntax>
    {
        internal static readonly QualifiedNameEmitter Default = new();

        private QualifiedNameEmitter() { }

        internal override void Emit(Emitter emitter, QualifiedNameSyntax node)
        {
            //暂这里忽略命名空间，eg: namespace1.Namespace2.XXX
            if (emitter.SemanticModel.GetSymbolInfo(node.Left).Symbol is not INamespaceSymbol)
            {
                emitter.Visit(node.Left);
                emitter.Write('.');
            }

            emitter.Visit(node.Right);
        }
    }
}