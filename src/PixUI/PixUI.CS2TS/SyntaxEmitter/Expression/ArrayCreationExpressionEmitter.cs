using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal static class ArrayCreationExpressionEmitter
    {
        internal static void Emit(Emitter emitter, ArrayCreationExpressionSyntax node)
        {
            emitter.Write('[');
            if (node.Initializer != null)
                emitter.VisitSeparatedList(node.Initializer.Expressions);
            emitter.Write(']');
        }

        internal static void Emit(Emitter emitter, ImplicitArrayCreationExpressionSyntax node)
        {
            emitter.Write('[');
            emitter.VisitSeparatedList(node.Initializer.Expressions);
            emitter.Write(']');
        }
    }
}