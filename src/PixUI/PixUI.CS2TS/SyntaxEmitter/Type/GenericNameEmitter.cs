using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class GenericNameEmitter : SyntaxEmitter<GenericNameSyntax>
    {
        internal static readonly GenericNameEmitter Default = new();

        private GenericNameEmitter() { }

        internal override void Emit(Emitter emitter, GenericNameSyntax node)
        {
            var symbol = emitter.SemanticModel.GetSymbolInfo(node).Symbol;

            //转换实例成员或静态成员
            if (symbol is IPropertySymbol or IFieldSymbol or IMethodSymbol or IEventSymbol)
            {
                emitter.TryWriteThisOrStaticMemberType(node, symbol);
            }
            //转换类型(添加包名称)
            else if (symbol is INamedTypeSymbol)
            {
                emitter.TryWritePackageName(node, symbol);
            }

            var name = node.Identifier.Text;
            if (symbol != null && symbol is not ILocalSymbol && symbol is not IParameterSymbol)
                emitter.TryRename(symbol, ref name);
            emitter.Write(name);

            //暂在这里重命名重载的系统类型 eg: Action<T1,T2>
            if (symbol is { Name: "Action" or "Func" } && symbol.GetRootNamespace()?.Name == "System")
                emitter.Write(node.TypeArgumentList.Arguments.Count.ToString());

            //写入范型参数，注意: GenericType<T>.StaticMethod<T>()忽略范型类型的参数，但不忽略方法的范型参数
            if (!emitter.ToJavaScript && (emitter.NeedGenericTypeArguments || symbol is IMethodSymbol))
            {
                emitter.VisitToken(node.TypeArgumentList.LessThanToken);
                var preNeedGenericTypes = emitter.NeedGenericTypeArguments;
                emitter.NeedGenericTypeArguments = true; //嵌套
                emitter.VisitSeparatedList(node.TypeArgumentList.Arguments);
                emitter.NeedGenericTypeArguments = preNeedGenericTypes;
                emitter.VisitToken(node.TypeArgumentList.GreaterThanToken);
            }
        }
    }
}