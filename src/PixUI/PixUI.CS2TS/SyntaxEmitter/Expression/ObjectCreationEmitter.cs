using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class ObjectCreationEmitter : SyntaxEmitter<ObjectCreationExpressionSyntax>
    {
        internal static readonly ObjectCreationEmitter Default = new();

        private ObjectCreationEmitter() { }

        internal override void Emit(Emitter emitter, ObjectCreationExpressionSyntax node)
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

            //Type, maybe: new SomeType \n{ Prop = 1}, so disable trailing trivia
            emitter.VisitToken(node.NewKeyword);
            if (node.ArgumentList == null)
                emitter.DisableVisitTrailingTrivia();
            emitter.Visit(node.Type);
            if (node.ArgumentList == null)
                emitter.EnableVisitTrailingTrivia();

            // arguments
            emitter.Write('(');
            if (node.ArgumentList != null)
                emitter.VisitSeparatedList(node.ArgumentList.Arguments);
            emitter.Write(')');
            
            // initializer
            emitter.Visit(node.Initializer);

            // TrailingTrivia
            if (node.Initializer == null)
                emitter.WriteTrailingTrivia(node);
        }
    }
}