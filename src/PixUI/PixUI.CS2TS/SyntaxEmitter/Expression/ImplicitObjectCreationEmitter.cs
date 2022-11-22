using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class ImplicitObjectCreationEmitter : SyntaxEmitter<ImplicitObjectCreationExpressionSyntax>
    {
        internal static readonly ImplicitObjectCreationEmitter Default = new();

        private ImplicitObjectCreationEmitter() { }

        internal override void Emit(Emitter emitter, ImplicitObjectCreationExpressionSyntax node)
        {
            var symbol = emitter.SemanticModel.GetSymbolInfo(node).Symbol;

            //尝试系统拦截
            if (symbol != null && symbol.IsSystemNamespace() &&
                SystemInterceptorMap.TryGetInterceptor(symbol.ContainingType.ToString(),
                    out var systemInterceptor))
            {
                emitter.WriteLeadingTrivia(node);
                systemInterceptor.Emit(emitter, node, symbol);
                return;
            }

            //尝试拦截器
            if (emitter.TryGetInterceptor(symbol, out var interceptor))
            {
                interceptor!.Emit(emitter, node, symbol!);
                return;
            }

            //特殊处理new RxEntity()
            if (ObjectCreationEmitter.TryEmitNewRxEntity(emitter, node, symbol!.ContainingType))
                return;

            //以下正常处理
            emitter.VisitToken(node.NewKeyword);
            emitter.Write(' ');
            emitter.WriteTypeSymbol(symbol!.ContainingType, !node.InSameSourceFile(symbol.ContainingType));

            // arguments
            emitter.Write('(');
            emitter.VisitSeparatedList(node.ArgumentList.Arguments);
            emitter.Write(')');

            // initializer
            emitter.Visit(node.Initializer);
        }
    }
}