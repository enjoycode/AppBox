using System.Linq;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using RoslynUtils;

namespace PixUI.CS2TS
{
    public partial class Emitter
    {
        #region ====Const TypeNames====

        internal const string PixUIProjectName = nameof(PixUI);

        internal const string TSTemplateAttributeFullName = "PixUI.TSTemplateAttribute";
        internal const string TSMethodIgnoreAttributeFullName = "PixUI.TSMethodIgnoreAttribute";
        internal const string TSCustomInterceptorAttributeFullName = "PixUI.TSCustomInterceptorAttribute";
        internal const string TSPropertyToGetSetAttributeFullName = "PixUI.TSPropertyToGetSetAttribute";

        internal static bool IsTSTypeAttribute(AttributeSyntax attribute)
            => IsAttribute(attribute, "TSType");

        internal static bool IsTSRenameAttribute(AttributeSyntax attribute)
            => IsAttribute(attribute, "TSRename");

        internal static bool IsTSInterfaceOfAttribute(AttributeSyntax attribute)
            => IsAttribute(attribute, "TSInterfaceOf");

        internal static bool IsTSRawScriptAttribute(AttributeSyntax attribute)
            => IsAttribute(attribute, "TSRawScript");

        internal static bool IsTSIndexerSetToMethodAttribute(AttributeSyntax attribute)
            => IsAttribute(attribute, "TSIndexerSetToMethod");

        private static bool IsAttribute(AttributeSyntax attribute, string shortName)
        {
            var name = attribute.Name.ToString();
            if (name == shortName) return true;

            return name == $"{shortName}Attribute"
                   || name == $"PixUI.{shortName}"
                   || name == $"PixUI.{shortName}Attribute";
        }

        #endregion

        #region =====Type Symbols====

        internal readonly TypeSymbolCache _typeSymbolCache;

        internal INamedTypeSymbol TypeOfICollection =>
            _typeSymbolCache.GetTypeByName("System.Collections.ICollection");

        internal INamedTypeSymbol TypeOfICollectionGeneric =>
            _typeSymbolCache.GetTypeByName("System.Collections.Generic.ICollection`1");

        internal INamedTypeSymbol TypeOfIDictionary =>
            _typeSymbolCache.GetTypeByName("System.Collections.Generic.IDictionary`2");

        internal INamedTypeSymbol TypeOfNullable =>
            _typeSymbolCache.GetTypeByName("System.Nullable`1");

        internal INamedTypeSymbol TypeOfAction => _typeSymbolCache.GetTypeByName("System.Action");

        internal INamedTypeSymbol TypeOfAction1 =>
            _typeSymbolCache.GetTypeByName("System.Action`1");

        internal INamedTypeSymbol TypeOfDelegate =>
            _typeSymbolCache.GetTypeByName("System.Delegate");

        internal INamedTypeSymbol TypeOfState => _typeSymbolCache.GetTypeByName("PixUI.State`1");

        internal INamedTypeSymbol TypeOfTSTypeAttribute
            => _typeSymbolCache.GetTypeByName("PixUI.TSTypeAttribute");

        internal INamedTypeSymbol TypeOfTSInterfaceOfAttribute
            => _typeSymbolCache.GetTypeByName("PixUI.TSInterfaceOfAttribute");

        private INamedTypeSymbol TypeOfTSRenameAttribute
            => _typeSymbolCache.GetTypeByName("PixUI.TSRenameAttribute");

        private INamedTypeSymbol TypeOfTSInterceptorAttribute =>
            _typeSymbolCache.GetTypeByName("PixUI.TSInterceptorAttribute");

        internal INamedTypeSymbol TypeOfTSIndexerSetToMethodAttribute =>
            _typeSymbolCache.GetTypeByName("PixUI.TSIndexerSetToMethodAttribute");

        #endregion

        internal bool TryGetInterceptor(ISymbol? symbol, out ITSInterceptor? interceptor)
        {
            interceptor = null;
            if (symbol == null || symbol.IsSystemNamespace()) return false;

            var interceptorAttribute = symbol.GetAttributes()
                .SingleOrDefault(t => t.AttributeClass != null &&
                                      t.AttributeClass.IsInherits(TypeOfTSInterceptorAttribute));

            if (interceptorAttribute == null) return false;

            interceptor = TSInterceptorFactory.Make(interceptorAttribute);
            return true;
        }

        /// <summary>
        /// 重命名
        /// 1.TSRenameAttribute的成员
        /// 2.ToString()
        /// </summary>
        internal void TryRename(ISymbol symbol, ref string name)
        {
            if (symbol is not IPropertySymbol && symbol is not IFieldSymbol && symbol is not IMethodSymbol &&
                symbol is not INamedTypeSymbol)
                return;

            if (symbol is IMethodSymbol method && name == "ToString" && method.Parameters.Length == 0)
            {
                name = "toString";
                return;
            }

            if (symbol.IsSystemNamespace()) return;

            var renameAttribute = symbol.TryGetAttribute(TypeOfTSRenameAttribute);
            if (renameAttribute == null) return;

            name = renameAttribute.ConstructorArguments[0].Value!.ToString();
        }
    }
}