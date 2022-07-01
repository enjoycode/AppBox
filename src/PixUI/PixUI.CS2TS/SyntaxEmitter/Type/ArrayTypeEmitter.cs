using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal static class ArrayTypeEmitter
    {
        internal static void Emit(Emitter emitter, ArrayTypeSyntax node)
        {
            if (node.ElementType is PredefinedTypeSyntax predefinedType)
            {
                var jsArrayType = predefinedType.Keyword.Kind() switch
                {
                    SyntaxKind.ByteKeyword => "Uint8Array",
                    SyntaxKind.SByteKeyword => "Int8Array",
                    SyntaxKind.ShortKeyword => "Int16Array",
                    SyntaxKind.UShortKeyword => "Uint16Array",
                    SyntaxKind.CharKeyword => "Uint16Array",
                    SyntaxKind.IntKeyword => "Int32Array",
                    SyntaxKind.UIntKeyword => "Uint32Array",
                    SyntaxKind.FloatKeyword => "Float32Array",
                    SyntaxKind.DoubleKeyword => "Float64Array",
                    _ => null
                };
                if (jsArrayType != null)
                {
                    emitter.Write(jsArrayType);
                    return;
                }
            }

            emitter.Visit(node.ElementType);
            emitter.Write("[]");
        }
    }
}