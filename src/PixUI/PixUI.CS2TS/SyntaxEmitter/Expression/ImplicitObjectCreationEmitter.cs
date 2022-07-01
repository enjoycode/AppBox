using System.Linq;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class
        ImplicitObjectCreationEmitter : SyntaxEmitter<ImplicitObjectCreationExpressionSyntax>
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

            // TODO: GetType from symbol
            var typeInfo = emitter.SemanticModel.GetTypeInfo(node);

            emitter.VisitToken(node.NewKeyword);
            emitter.Write(' ');
            emitter.WriteTypeSymbol(typeInfo.Type!, !node.InSameSourceFile(typeInfo.Type!));

            // arguments
            emitter.Write('(');
            emitter.VisitSeparatedList(node.ArgumentList.Arguments);
            emitter.Write(')');

            // initializer
            emitter.Visit(node.Initializer);
        }
    }
}