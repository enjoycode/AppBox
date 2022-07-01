using Microsoft.CodeAnalysis;

namespace PixUI.CS2TS
{
    internal sealed class TSMethodIngnoreInterceptor : ITSInterceptor
    {
        internal static readonly TSMethodIngnoreInterceptor Default = new();

        private TSMethodIngnoreInterceptor() { }

        void ITSInterceptor.Emit(Emitter emitter, SyntaxNode node, ISymbol symbol)
        {
            //do nothing
        }
    }
}