using System;
using System.Linq;
using System.Collections.Generic;
using Microsoft.CodeAnalysis;

namespace RoslynUtils
{
    internal sealed class TypeSymbolCache
    {
        internal TypeSymbolCache(SemanticModel semanticModel)
        {
            _semanticModel = semanticModel;
        }

        private readonly SemanticModel _semanticModel;
        private readonly Dictionary<string, INamedTypeSymbol> _typesCache = new();

        internal INamedTypeSymbol TypeOfEntity => GetTypeByName("AppBoxCore.Entity");

        internal INamedTypeSymbol GetTypeByName(string typeName)
        {
            var type = TryGetTypeByName(typeName);
            if (type == null)
                throw new ArgumentException($"Can't find type by name: {typeName}");
            return type;
        }

        internal INamedTypeSymbol? TryGetTypeByName(string typeName)
        {
            if (_typesCache.TryGetValue(typeName, out var typeSymbol))
                return typeSymbol;

            var type = _semanticModel.Compilation.GetTypeByMetadataName(typeName);
            if (type != null) _typesCache[typeName] = type;
            return type;
        }
    }

    public static class RoslynExtensions
    {
        /// <summary>
        /// 判断当前类型是否继承自指定类型
        /// </summary>
        internal static bool IsInherits(this ITypeSymbol symbol, ITypeSymbol type)
        {
            var baseType = symbol.BaseType;
            while (baseType != null)
            {
                if (SymbolEqualityComparer.Default.Equals(type, baseType))
                    return true;

                baseType = baseType.BaseType;
            }

            return false;
        }

        /// <summary>
        /// 用于检测是否模型类，是则加入列表
        /// </summary>
        internal static bool IsAppBoxModel(this ISymbol symbol, TypeSymbolCache typesCache,
            Action<string> addAction)
        {
            if (symbol is not ITypeSymbol typeSymbol) return false;

            if (symbol.IsAppBoxEntity(typesCache))
            {
                addAction(symbol.ToString());
                return true;
            }

            return false;
        }

        /// <summary>
        /// 用于检查类型是否包含模型类
        /// </summary>
        internal static void CheckTypeHasAppBoxModel(this ITypeSymbol typeSymbol,
            TypeSymbolCache typesCache, Action<string> addAction)
        {
            //检查Entity数组
            if (typeSymbol is IArrayTypeSymbol arrayTypeSymbol)
            {
                CheckTypeHasAppBoxModel(arrayTypeSymbol.ElementType, typesCache, addAction);
                return;
            }

            //检查其他范型集合
            if (typeSymbol is INamedTypeSymbol { IsGenericType: true } namedTypeSymbol)
            {
                foreach (var typeArgument in namedTypeSymbol.TypeArguments)
                {
                    CheckTypeHasAppBoxModel(typeArgument, typesCache, addAction);
                }

                return;
            }

            IsAppBoxModel(typeSymbol, typesCache, addAction);
        }

        /// <summary>
        /// 是否AppBox实体类型
        /// </summary>
        /// <param name="symbol"></param>
        /// <returns></returns>
        internal static bool IsAppBoxEntity(this ISymbol symbol, TypeSymbolCache typesCache)
        {
            return symbol is INamedTypeSymbol typeSymbol &&
                   typeSymbol.ContainingNamespace.Name == "Entities" &&
                   typeSymbol.IsInherits(typesCache.TypeOfEntity);
        }

        /// <summary>
        /// 是否AppBox服务方法
        /// </summary>
        internal static bool IsAppBoxServiceMethod(this IMethodSymbol symbol)
        {
            if (symbol.ContainingNamespace.Name != "Services") return false;
            var interceptorAttribute = symbol.GetAttributes()
                .SingleOrDefault(t => t.AttributeClass != null &&
                                      t.AttributeClass.ToString() ==
                                      "System.Reflection.InvocationInterceptorAttribute");
            return interceptorAttribute != null;
        }
    }
}