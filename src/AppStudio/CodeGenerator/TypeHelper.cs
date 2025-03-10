using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using RoslynUtils;

namespace AppBoxDesign;

internal static class TypeHelper
{
    #region ====设计时类型常量====

    internal const string MemberAccessInterceptorAttribute = "AppBoxCore.MemberAccessInterceptorAttribute";
    internal const string InvocationInterceptorAttribute = "AppBoxCore.InvocationInterceptorAttribute";
    internal const string InvokePermissionAttribute = "AppBoxCore.InvokePermissionAttribute";
    internal const string PermissionAttribte = "AppBoxClient.PermissionAttribute";

    #endregion

    #region ====IsXXX Methods====

    internal static bool IsServiceClass(ClassDeclarationSyntax? node, string appName,
        string serviceName)
    {
        if (node == null) return false;

        return node.Identifier.ValueText == serviceName;
        // return node.Parent is NamespaceDeclarationSyntax parentNamespace
        //        && parentNamespace.Name.ToString() == appName + ".ServiceLogic"
        //        && node.Identifier.ValueText == serviceName;
    }

    internal static bool IsServiceMethod(MethodDeclarationSyntax? node)
    {
        if (node == null) return false;

        //TODO:暂简单判断方法是否public，还需要判断返回类型
        return node.Modifiers.Any(t => t.ValueText == "public");
    }

    internal static bool IsViewClass(ClassDeclarationSyntax? node, string appName, string viewName)
    {
        if (node == null) return false;

        return node.Identifier.ValueText == viewName;
    }

    internal static bool IsListGeneric(ITypeSymbol typeSymbol, TypeSymbolCache typeSymbolCache)
    {
        return (typeSymbol.Name == "IList" &&
                SymbolEqualityComparer.Default.Equals(typeSymbol.OriginalDefinition,
                    typeSymbolCache.TypeOfIListGeneric))
               ||
               (typeSymbol.Name == "List" &&
                SymbolEqualityComparer.Default.Equals(typeSymbol.OriginalDefinition,
                    typeSymbolCache.TypeOfListGeneric));
    }

    #endregion

    #region ====运行时类型转换====

    private static readonly Dictionary<string, TypeSyntax> realTypes = new();

    internal static TypeSyntax GetRealType(string realTypeName)
    {
        if (!realTypes.TryGetValue(realTypeName, out var found))
        {
            found = SyntaxFactory.ParseTypeName(realTypeName);
            realTypes.Add(realTypeName, found);
        }

        return found;
    }

    internal static TypeSyntax ServiceInterfaceType => GetRealType("AppBoxCore.IService");

    #endregion

    internal static string GetEntityMemberTypeString(ITypeSymbol valueTypeSymbol, out bool isNullable)
    {
        isNullable = false;
        var valueTypeString = valueTypeSymbol.ToString();
        //先处理一些特殊类型
        if (valueTypeString.AsSpan().EndsWith("?")) //nullable
        {
            valueTypeString = valueTypeString.Remove(valueTypeString.Length - 1, 1);
            isNullable = true;
        }
        // else if (valueTypeString.AsSpan().StartsWith("EntitySet")) //TODO:暂简单判断
        //     valueTypeString = "EntitySet";
        // else if (IsEntityClass(valueTypeSymbol as INamedTypeSymbol))
        //     valueTypeString = "RuntimeType_Entity";

        string type;
        switch (valueTypeString)
        {
            case "int":
                type = "Int";
                break;
            case "long":
                type = "Long";
                break;
            case "bool":
                type = "Bool";
                break;
            case "byte":
                type = "Byte";
                break;
            case "float":
                type = "Float";
                break;
            case "double":
                type = "Double";
                break;
            case "decimal":
                type = "Decimal";
                break;
            case "System.Guid":
            case "Guid":
                type = "Guid";
                break;
            case "System.DateTime":
            case "DateTime":
                type = "DateTime";
                break;
            case "byte[]":
                type = "Binary";
                break;
            case "string":
                type = "String";
                break;
            default: //other enum
                throw new NotImplementedException();
                //type = "Int32";
                break;
        }

        return type;
    }

    internal static ITypeSymbol? GetSymbolType(ISymbol symbol)
    {
        return symbol switch
        {
            IMethodSymbol methodSymbol => methodSymbol.ReturnType,
            ILocalSymbol localSymbol => localSymbol.Type,
            IParameterSymbol parameterSymbol => parameterSymbol.Type,
            IPropertySymbol propertySymbol => propertySymbol.Type,
            IFieldSymbol fieldSymbol => fieldSymbol.Type,
            _ => null
        };
    }
    
    internal static AttributeSyntax? TryGetAttribute(SyntaxList<AttributeListSyntax> attributes,
        Predicate<AttributeSyntax> checker)
    {
        if (attributes.Count == 0) return null;

        var attribute = attributes
            .SelectMany(t => t.Attributes)
            .SingleOrDefault(t => checker(t));

        return attribute;
    }
}