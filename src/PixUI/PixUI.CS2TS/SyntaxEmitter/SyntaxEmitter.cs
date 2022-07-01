using Microsoft.CodeAnalysis;

namespace PixUI.CS2TS
{
    internal abstract class SyntaxEmitter<T> where T : SyntaxNode
    {
        internal abstract void Emit(Emitter emitter, T node);
    }
}