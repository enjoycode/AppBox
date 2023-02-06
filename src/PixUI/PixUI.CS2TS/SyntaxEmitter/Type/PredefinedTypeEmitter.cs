using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class PredefinedTypeEmitter : SyntaxEmitter<PredefinedTypeSyntax>
    {
        internal static readonly PredefinedTypeEmitter Default = new();

        private PredefinedTypeEmitter() { }

        internal override void Emit(Emitter emitter, PredefinedTypeSyntax node)
        {
            //TODO: others
            switch (node.Keyword.Kind())
            {
                case SyntaxKind.StringKeyword:
                    emitter.Write("string");
                    break;
                case SyntaxKind.CharKeyword: //注意char转为number
                case SyntaxKind.ByteKeyword:
                case SyntaxKind.SByteKeyword:
                case SyntaxKind.ShortKeyword:
                case SyntaxKind.UShortKeyword:
                case SyntaxKind.IntKeyword:
                case SyntaxKind.UIntKeyword:
                case SyntaxKind.FloatKeyword:
                case SyntaxKind.DoubleKeyword:
                    emitter.Write("number");
                    break;
                case SyntaxKind.BoolKeyword:
                    emitter.Write("boolean");
                    break;
                case SyntaxKind.ObjectKeyword:
                    emitter.Write("any");
                    break;
                default:
                    emitter.Write("any");
                    break;
            }
        }
    }
}