using System.Linq;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    partial class Emitter
    {
        public override void VisitArrayType(ArrayTypeSyntax node)
        {
            //需要排除 SomeMethod(params int[] args)特例
            if (node.Parent is ParameterSyntax parameterSyntax && 
                parameterSyntax.Modifiers.All(m => m.Kind() != SyntaxKind.ParamsKeyword))
            {
                var jsArrayType = GetJsNativeArrayType(node);
                if (jsArrayType != null)
                {
                    Write(jsArrayType);
                    return;
                }
            }

            Visit(node.ElementType);
            Write("[]");
        }

        private static string? GetJsNativeArrayType(ArrayTypeSyntax node)
        {
            if (node.ElementType is not PredefinedTypeSyntax predefinedType)
                return null;

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
            return jsArrayType;
        }
    }
}