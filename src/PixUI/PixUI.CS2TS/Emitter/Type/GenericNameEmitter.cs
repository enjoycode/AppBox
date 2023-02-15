using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    partial class Emitter
    {
        public override void VisitGenericName(GenericNameSyntax node)
        {
            var symbol = SemanticModel.GetSymbolInfo(node).Symbol;

            //转换实例成员或静态成员
            if (symbol is IPropertySymbol or IFieldSymbol or IMethodSymbol or IEventSymbol)
            {
                TryWriteThisOrStaticMemberType(node, symbol);
            }
            //转换类型(添加包名称)
            else if (symbol is INamedTypeSymbol)
            {
                TryWritePackageName(node, symbol);
            }

            var name = node.Identifier.Text;
            if (symbol != null && symbol is not ILocalSymbol && symbol is not IParameterSymbol)
                TryRenameSymbol(symbol, ref name);
            Write(name);

            //暂在这里重命名重载的系统类型 eg: Action<T1,T2>
            if (symbol is { Name: "Action" or "Func" } && symbol.GetRootNamespace()?.Name == "System")
                Write(node.TypeArgumentList.Arguments.Count.ToString());

            //写入范型参数，注意: GenericType<T>.StaticMethod<T>()忽略范型类型的参数，但不忽略方法的范型参数
            if (!ToJavaScript && (NeedGenericTypeArguments || symbol is IMethodSymbol))
            {
                VisitToken(node.TypeArgumentList.LessThanToken);
                var preNeedGenericTypes = NeedGenericTypeArguments;
                NeedGenericTypeArguments = true; //嵌套
                VisitSeparatedList(node.TypeArgumentList.Arguments);
                NeedGenericTypeArguments = preNeedGenericTypes;
                VisitToken(node.TypeArgumentList.GreaterThanToken);
            }
        }
    }
}