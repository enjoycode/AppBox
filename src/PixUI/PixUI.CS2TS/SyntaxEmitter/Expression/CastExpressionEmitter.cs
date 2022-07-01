using System;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal static class CastExpressionEmitter
    {
        internal static void Emit(Emitter emitter, CastExpressionSyntax node)
        {
            if (emitter.ToJavaScript)
            {
                emitter.Visit(node.Expression);
                return;
            }

            //特殊处理整型转换 eg: (int)someNumber
            if (node.Type is PredefinedTypeSyntax predefinedType)
            {
                //排除枚举值
                var symbol = emitter.SemanticModel.GetSymbolInfo(node.Expression).Symbol;
                if (symbol == null || symbol.ContainingType.TypeKind != TypeKind.Enum)
                {
                    var kind = predefinedType.Keyword.Kind();
                    switch (kind)
                    {
                        case SyntaxKind.CharKeyword:
                        case SyntaxKind.ByteKeyword:
                        case SyntaxKind.SByteKeyword:
                            CastToInteger(emitter, node, "0xFF");
                            return;
                        case SyntaxKind.ShortKeyword:
                        case SyntaxKind.UShortKeyword:
                            CastToInteger(emitter, node, "0xFFFF");
                            return;
                        case SyntaxKind.IntKeyword:
                        case SyntaxKind.UIntKeyword:
                            CastToInteger(emitter, node, "0xFFFFFFFF");
                            return;
                        case SyntaxKind.LongKeyword:
                        case SyntaxKind.ULongKeyword:
                            throw new NotImplementedException();
                    }
                }
            }

            emitter.Write('<');
            emitter.Visit(node.Type);
            // emitter.Write('>');
            //TODO:判断是否需要<unknown>
            emitter.Write("><unknown>"); //<any>为了消除一些警告
            emitter.Visit(node.Expression);
        }

        private static void CastToInteger(Emitter emitter, CastExpressionSyntax node, string mask)
        {
            emitter.Write("(Math.floor(");
            emitter.Visit(node.Expression);
            emitter.Write(") & ");
            emitter.Write(mask);
            emitter.Write(')');
        }
    }
}