using System.Linq;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class MemberAccessExpressionEmitter : SyntaxEmitter<MemberAccessExpressionSyntax>
    {
        internal static readonly MemberAccessExpressionEmitter Default = new();

        private MemberAccessExpressionEmitter() { }

        internal override void Emit(Emitter emitter, MemberAccessExpressionSyntax node)
        {
            var symbol = emitter.SemanticModel.GetSymbolInfo(node).Symbol!;

            //先判断是否System命名空间的成员
            if (symbol.IsSystemNamespace())
            {
                if (TryEmitNullable(emitter, node, symbol))
                    return;

                if (SystemInterceptorMap.TryGetInterceptor(symbol.ContainingType.ToString(),
                        out var systemInterceptor))
                {
                    systemInterceptor.Emit(emitter, node, symbol);
                    return;
                }
            }
            //再判断是否有拦截器
            else if (emitter.TryGetInterceptor(symbol, out var interceptor))
            {
                interceptor!.Emit(emitter, node, symbol);
                return;
            }

            var expressionSymbol = emitter.SemanticModel.GetSymbolInfo(node.Expression).Symbol;

            //特殊处理CanvasKit导出的枚举(因为只导出了类型)
            if (TryEmitCanvasKitEnumMember(emitter, node, expressionSymbol))
                return;

            //暂这里忽略命名空间，eg: namespace1.Namespace2.XXX
            if (expressionSymbol is not INamespaceSymbol)
            {
                emitter.Visit(node.Expression);
                emitter.VisitToken(node.OperatorToken); //TODO: not supported pointer
            }

            // eg: list.Count convert to list.length
            if (!TryRenameCollectionCountProperty(emitter, node, symbol))
                emitter.Visit(node.Name);
        }

        private static bool TryEmitNullable(Emitter emitter, MemberAccessExpressionSyntax node,
            ISymbol symbol)
        {
            var name = node.Name.Identifier.Text;
            if (name is not ("Value" or "HasValue") ||
                !symbol.ContainingType.IsNullableType(emitter.TypeOfNullable))
                return false;

            emitter.Visit(node.Expression);
            // 暂不写入！，前端ts关闭严格null模式
            // if (name == "Value" && node.Parent is not AssignmentExpressionSyntax)
            //     emitter.Write('!');
            return true;
        }

        private static bool IsCollectionType(INamedTypeSymbol type, Emitter emitter)
        {
            //先判断本身是否ICollection
            var isCollection = type.TypeKind == TypeKind.Interface && (
                SymbolEqualityComparer.Default.Equals(type, emitter.TypeOfICollection)
                ||
                SymbolEqualityComparer.Default.Equals(type.OriginalDefinition, emitter.TypeOfICollectionGeneric)
            );
            //再判断有无实现ICollection接口
            if (!isCollection)
                isCollection = type.AllInterfaces.Any(t =>
                    SymbolEqualityComparer.Default.Equals(t, emitter.TypeOfICollection)
                    ||
                    SymbolEqualityComparer.Default.Equals(t.OriginalDefinition, emitter.TypeOfICollectionGeneric)
                );
            return isCollection;
        }

        private static bool TryRenameCollectionCountProperty(Emitter emitter,
            MemberAccessExpressionSyntax node, ISymbol symbol)
        {
            if (node.Name.Identifier.Text == "Count" && symbol is IPropertySymbol propertySymbol)
            {
                var type = propertySymbol.ContainingType;
                var isCollection = IsCollectionType(type, emitter);
                if (isCollection)
                {
                    emitter.Write("length");
                    emitter.VisitTrailingTrivia(node.Name.Identifier);
                    return true;
                }
            }

            return false;
        }

        private static bool TryEmitCanvasKitEnumMember(Emitter emitter,
            MemberAccessExpressionSyntax node, ISymbol? expressionSymbol)
        {
            if (expressionSymbol is INamedTypeSymbol { TypeKind: TypeKind.Enum } typeSymbol &&
                typeSymbol.ContainingNamespace.Name == Emitter.PixUIProjectName)
            {
                var attributes = typeSymbol.GetAttributes();
                if (attributes.Length == 0) return false;

                if (!Emitter.IsTSTypeAttribute(attributes[0].AttributeClass))
                    return false;

                var tsTypeName = attributes[0].ConstructorArguments[0].Value!.ToString();
                if (!tsTypeName.StartsWith("CanvasKit.")) return false;

                emitter.Write(tsTypeName);
                emitter.Write('.');
                emitter.Write(node.Name.Identifier.Text);
                return true;
            }

            return false;
        }
    }
}