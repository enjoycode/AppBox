using System;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class AssignmentExpressionEmitter : SyntaxEmitter<AssignmentExpressionSyntax>
    {
        internal static readonly AssignmentExpressionEmitter Default = new();

        private AssignmentExpressionEmitter() { }

        internal override void Emit(Emitter emitter, AssignmentExpressionSyntax node)
        {
            //判断是否拦截TSPropertyToGetSet
            if (node.Left is MemberAccessExpressionSyntax memberAccess)
            {
                var symbolInfo = emitter.SemanticModel.GetSymbolInfo(memberAccess.Name);
                if (emitter.TryGetInterceptor(symbolInfo.Symbol, out var interceptor))
                {
                    interceptor!.Emit(emitter, node, symbolInfo.Symbol!);
                    return;
                }
            }

            var leftSymbol = emitter.SemanticModel.GetSymbolInfo(node.Left).Symbol;
            var rightSymbol = emitter.SemanticModel.GetSymbolInfo(node.Right).Symbol;

            //判断是否事件+=或者-=操作
            if (TryEmitEventAssignment(emitter, node, leftSymbol, rightSymbol))
                return;

            emitter.Visit(node.Left);
            emitter.VisitToken(node.OperatorToken);
            
            //right 隐式转换
            var typeInfo = emitter.SemanticModel.GetTypeInfo(node.Right);
            emitter.TryImplictConversionOrStructClone(typeInfo, node.Right);
        }

        private static bool TryEmitEventAssignment(Emitter emitter, AssignmentExpressionSyntax node,
            ISymbol? leftSymbol, ISymbol? rightSymbol)
        {
            var kind = node.OperatorToken.Kind();
            if (kind != SyntaxKind.PlusEqualsToken && kind != SyntaxKind.MinusEqualsToken)
                return false;

            var isEvent = leftSymbol is IEventSymbol;
            if (isEvent)
            {
                emitter.Visit(node.Left);
                emitter.Write(kind == SyntaxKind.PlusEqualsToken ? ".Add(" : ".Remove(");
                emitter.IgnoreDelegateBind = true;
                emitter.Visit(node.Right);
                emitter.IgnoreDelegateBind = false;

                //判断是否静态方法,实例方法需要传入实例作为回调的this
                if (rightSymbol is { IsStatic: false } && node.Right is not LambdaExpressionSyntax)
                {
                    emitter.Write(", ");

                    //TODO: check other type of node.Right
                    if (node.Right is MemberAccessExpressionSyntax memberAccess)
                    {
                        if (memberAccess.Expression is ObjectCreationExpressionSyntax)
                            throw new NotSupportedException("Can't bind to ObjectCreation");

                        emitter.Visit(memberAccess.Expression);
                    }
                    else
                    {
                        emitter.Write("this");
                    }
                }

                emitter.Write(')');
                return true;
            }

            return false;
        }
    }
}