using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    public partial class Emitter
    {
        #region ====Const TypeNames====

        internal const string PixUIProjectName = nameof(PixUI);

        private const string TSRenameAttributeFullName = "PixUI.TSRenameAttribute";
        private const string TSInterfaceOfAttributeFullName = "PixUI.TSInterfaceOfAttribute";
        private const string TSTypeAttributeName = "TSTypeAttribute";
        private const string TSInterceptorAttributeFullName = "PixUI.TSInterceptorAttribute";
        internal const string TSTemplateAttributeFullName = "PixUI.TSTemplateAttribute";
        internal const string TSMethodIgnoreAttributeFullName = "PixUI.TSMethodIgnoreAttribute";

        internal const string TSCustomInterceptorAttributeFullName =
            "PixUI.TSCustomInterceptorAttribute";

        internal const string TSPropertyToGetSetAttributeFullName =
            "PixUI.TSPropertyToGetSetAttribute";

        internal static bool IsTSTypeAttribute(AttributeSyntax attribute)
            => IsAttribute(attribute, "TSType");

        internal static bool IsTSTypeAttribute(INamedTypeSymbol? symbol)
        {
            if (symbol == null) return false;
            return symbol.ContainingNamespace.Name == PixUIProjectName &&
                   symbol.Name == TSTypeAttributeName;
        }

        internal static bool IsTSRenameAttribute(AttributeSyntax attribute)
            => IsAttribute(attribute, "TSRename");

        internal static bool IsTSInterfaceOfAttribute(AttributeSyntax attribute)
            => IsAttribute(attribute, "TSInterfaceOf");

        internal static bool IsTSRawScriptAttribute(AttributeSyntax attribute)
            => IsAttribute(attribute, "TSRawScript");

        internal static bool IsTSNoInitializerAttribute(AttributeSyntax attribute)
            => IsAttribute(attribute, "TSNoInitializer");

        internal static bool IsTSGenericTypeOverloadsAttribute(AttributeSyntax attribute)
            => IsAttribute(attribute, "TSGenericTypeOverloads");

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

        private readonly Dictionary<string, INamedTypeSymbol> _typesCache = new();

        private INamedTypeSymbol GetTypeByName(string typeName)
        {
            var type = TryGetTypeByName(typeName);
            if (type == null)
                throw new ArgumentException($"Can't find type by name: {typeName}");
            return type;
        }

        private INamedTypeSymbol? TryGetTypeByName(string typeName)
        {
            if (_typesCache.TryGetValue(typeName, out var typeSymbol))
                return typeSymbol;

            var type = SemanticModel.Compilation.GetTypeByMetadataName(typeName);
            if (type != null) _typesCache[typeName] = type;
            return type;
        }

        internal INamedTypeSymbol TypeOfICollection =>
            GetTypeByName("System.Collections.ICollection");

        internal INamedTypeSymbol TypeOfICollectionGeneric =>
            GetTypeByName("System.Collections.Generic.ICollection`1");

        internal INamedTypeSymbol TypeOfIDictionary =>
            GetTypeByName("System.Collections.Generic.IDictionary`2");

        internal INamedTypeSymbol TypeOfNullable => GetTypeByName("System.Nullable`1");

        internal INamedTypeSymbol TypeOfAction => GetTypeByName("System.Action");

        internal INamedTypeSymbol TypeOfAction1 => GetTypeByName("System.Action`1");

        internal INamedTypeSymbol TypeOfDelegate => GetTypeByName("System.Delegate");

        internal INamedTypeSymbol TypeOfState => GetTypeByName("PixUI.State`1");

        internal INamedTypeSymbol TypeOfTSInterfaceOfAttribute
            => GetTypeByName(TSInterfaceOfAttributeFullName);

        private INamedTypeSymbol TypeOfTSRenameAttribute =>
            GetTypeByName(TSRenameAttributeFullName);

        private INamedTypeSymbol TypeOfTSInterceptorAttribute =>
            GetTypeByName(TSInterceptorAttributeFullName);

        #endregion
        
        #region ====模型类型====

        private INamedTypeSymbol? TypeOfEntity => TryGetTypeByName("AppBoxCore.Entity");

        /// <summary>
        /// 专用于检测是否模型类，是则加入列表
        /// </summary>
        internal bool IsAppBoxModel(ISymbol symbol)
        {
            if (!TrackModelUsages) return false;
            if (symbol is not ITypeSymbol typeSymbol) return false;

            if (typeSymbol.IsInherits(TypeOfEntity!))
            {
                AddUsedModel(symbol.ToString());
                return true;
            }

            return false;
        }

        internal void CheckTypeHasAppBoxModel(ITypeSymbol typeSymbol)
        {
            //检查Entity数组
            if (typeSymbol is IArrayTypeSymbol arrayTypeSymbol)
            {
                CheckTypeHasAppBoxModel(arrayTypeSymbol.ElementType);
                return;
            }
            //检查其他范型集合
            if (typeSymbol is INamedTypeSymbol { IsGenericType: true } namedTypeSymbol)
            {
                foreach (var typeArgument in namedTypeSymbol.TypeArguments)
                {
                    CheckTypeHasAppBoxModel(typeArgument);
                }
                return;
            }

            IsAppBoxModel(typeSymbol);
        }

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
            if (symbol is not IPropertySymbol && symbol is not IFieldSymbol &&
                symbol is not IMethodSymbol) return;

            if (symbol is IMethodSymbol method && name == "ToString" &&
                method.Parameters.Length == 0)
            {
                name = "toString";
                return;
            }

            if (symbol.IsSystemNamespace()) return;

            var renameAttribute = symbol.GetAttributes()
                .SingleOrDefault(t => t.AttributeClass != null &&
                                      t.AttributeClass.Equals(TypeOfTSRenameAttribute));
            if (renameAttribute == null) return;

            name = renameAttribute.ConstructorArguments[0].Value!.ToString();
        }
    }
}