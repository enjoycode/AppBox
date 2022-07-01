using System;
using System.Linq;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class IdentifierNameEmitter : SyntaxEmitter<IdentifierNameSyntax>
    {
        internal static readonly IdentifierNameEmitter Default = new();

        private IdentifierNameEmitter() { }

        internal override void Emit(Emitter emitter, IdentifierNameSyntax node)
        {
            emitter.VisitLeadingTrivia(node.Identifier);

            var symbol = emitter.SemanticModel.GetSymbolInfo(node).Symbol!;

            //转换实例成员或静态成员
            if (symbol is IPropertySymbol or IFieldSymbol or IMethodSymbol or IEventSymbol)
            {
                emitter.TryWriteThisOrStaticMemberType(node, symbol);
            }
            //转换类型(添加包名称)
            else if (symbol is INamedTypeSymbol)
            {
                if (TryInterceptorSystem(emitter, node, symbol))
                    return;
                emitter.TryWritePackageName(node, symbol);
            }

            var name = node.Identifier.Text;
            if (symbol is not ILocalSymbol && symbol is not IParameterSymbol)
                emitter.TryRename(symbol, ref name);
            emitter.Write(name);

            //转换委托的this绑定
            if (!emitter.IgnoreDelegateBind && !symbol.IsStatic && symbol is IMethodSymbol)
            {
                var typeInfo = emitter.SemanticModel.GetTypeInfo(node);
                if (typeInfo.ConvertedType is { TypeKind: TypeKind.Delegate })
                {
                    EmitDelegateBind(emitter, node, symbol);
                }
            }

            emitter.VisitTrailingTrivia(node.Identifier);
        }

        /// <summary>
        /// 尝试系统类型的拦截
        /// </summary>
        private static bool TryInterceptorSystem(Emitter emitter, IdentifierNameSyntax node,
            ISymbol symbol)
        {
            if (!symbol.IsSystemNamespace() ||
                !SystemInterceptorMap.TryGetInterceptor(
                    symbol.ToString(), out var interceptor)) return false;
            interceptor.Emit(emitter, node, symbol);
            return true;
        }

        private static void EmitDelegateBind(Emitter emitter, IdentifierNameSyntax node,
            ISymbol symbol)
        {
            emitter.Write(".bind(");
            if (node.Parent is MemberAccessExpressionSyntax memberAccess)
            {
                if (memberAccess.Expression is ObjectCreationExpressionSyntax)
                    throw new NotSupportedException("Can't bind to ObjectCreation");

                emitter.Visit(memberAccess.Expression);
            }
            // else if (node.Parent is MemberBindingExpressionSyntax memberBinding)
            // {
            //     emitter.Visit(memberBinding.Name);
            // }
            else
            {
                emitter.Write("this");
            }

            emitter.Write(')');
        }
    }
}