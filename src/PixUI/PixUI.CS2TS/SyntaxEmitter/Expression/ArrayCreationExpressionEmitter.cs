using System;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal static class ArrayCreationExpressionEmitter
    {
        internal static void Emit(Emitter emitter, ArrayCreationExpressionSyntax node)
        {
            //eg: var array = new int[3];
            if (node.Type.RankSpecifiers.Count > 0 &&
                node.Type.RankSpecifiers[0].Sizes.Count > 0 &&
                node.Type.RankSpecifiers[0].Sizes[0] is not OmittedArraySizeExpressionSyntax)
            {
                if (node.Type.RankSpecifiers.Count > 1)
                    throw new NotImplementedException("新建指定长度数组");
                if (node.Initializer != null) throw new NotImplementedException("新建指定长度数组且具有初始化器");

                //先判断js原生数组类型
                var jsArrayType = ArrayTypeEmitter.GetJsNativeArrayType(node.Type);
                if (jsArrayType != null)
                {
                    emitter.Write($"new {jsArrayType}");
                }
                else
                {
                    emitter.Write("new Array");
                    if (!emitter.ToJavaScript)
                    {
                        emitter.Write('<');
                        emitter.Visit(node.Type.ElementType);
                        emitter.Write('>');
                    }
                }

                emitter.Write('(');
                emitter.Visit(node.Type.RankSpecifiers[0].Sizes[0]);
                emitter.Write(')');

                //如果ElementType是值类型必须填充默认值
                if (jsArrayType == null)
                {
                    var elementTypeSymbol =
                        emitter.SemanticModel.GetSymbolInfo(node.Type.ElementType);
                    if (elementTypeSymbol.Symbol is ITypeSymbol { IsValueType: true })
                    {
                        emitter.Write(".fill(");
                        emitter.TryWriteDefaultValueForValueType(node.Type.ElementType, node,
                            false);
                        emitter.Write(')');
                    }
                }
            }
            else
            {
                emitter.Write('[');
                if (node.Initializer != null)
                    emitter.VisitSeparatedList(node.Initializer.Expressions);
                emitter.Write(']');
            }
        }

        internal static void Emit(Emitter emitter, ImplicitArrayCreationExpressionSyntax node)
        {
            emitter.Write('[');
            emitter.VisitSeparatedList(node.Initializer.Expressions);
            emitter.Write(']');
        }
    }
}