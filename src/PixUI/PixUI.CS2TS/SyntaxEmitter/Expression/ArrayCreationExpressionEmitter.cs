using System;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    partial class Emitter
    {
        public override void VisitArrayCreationExpression(ArrayCreationExpressionSyntax node)
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
                    Write($"new {jsArrayType}");
                }
                else
                {
                    Write("new Array");
                    if (!ToJavaScript)
                    {
                        Write('<');
                        Visit(node.Type.ElementType);
                        Write('>');
                    }
                }

                Write('(');
                Visit(node.Type.RankSpecifiers[0].Sizes[0]);
                Write(')');

                //如果ElementType是值类型必须填充默认值
                if (jsArrayType == null)
                {
                    var elementTypeSymbol = SemanticModel.GetSymbolInfo(node.Type.ElementType);
                    if (elementTypeSymbol.Symbol is ITypeSymbol { IsValueType: true })
                    {
                        Write(".fill(");
                        TryWriteDefaultValueForValueType(node.Type.ElementType, node,
                            false);
                        Write(')');
                    }
                }
            }
            else
            {
                if (node.Initializer != null)
                {
                    if (node.Parent is not ReturnStatementSyntax)
                        WriteTrailingTrivia(node.Type);
                    EmitArrayInitializer(node.Initializer);
                }
                else
                {
                    Write("[]");
                }
            }
        }


        public override void VisitImplicitArrayCreationExpression(ImplicitArrayCreationExpressionSyntax node)
        {
            if (node.Parent is not ReturnStatementSyntax)
                VisitTrailingTrivia(node.CloseBracketToken);
            EmitArrayInitializer(node.Initializer);
        }

        private void EmitArrayInitializer(InitializerExpressionSyntax initializer)
        {
            VisitLeadingTrivia(initializer.OpenBraceToken);
            Write('[');
            VisitTrailingTrivia(initializer.OpenBraceToken);

            VisitSeparatedList(initializer.Expressions);

            VisitLeadingTrivia(initializer.CloseBraceToken);
            Write(']');
            VisitTrailingTrivia(initializer.CloseBraceToken);
        }
    }
}