using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

internal static class TypeHelper
{
    #region ====设计时类型常量====

    internal const string MemberAccessInterceptorAttribute =
        "System.Reflection.MemberAccessInterceptorAttribute";

    internal const string InvocationInterceptorAttribute =
        "System.Reflection.InvocationInterceptorAttribute";

    internal const string GenericCreateAttribute = "System.Reflection.GenericCreateAttribute";
    internal const string QueriableClassAttribute = "System.Reflection.QueriableClassAttribute";
    internal const string QueryMethodAttribute = "System.Reflection.QueryMethodAttribute";
    internal const string EnumModelAttribute = "System.Reflection.EnumModelAttribute";
    internal const string RealTypeAttribute = "System.Reflection.RealTypeAttribute";
    internal const string InvokePermissionAttribute = "InvokePermissionAttribute";

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

    internal static string GetEntityMemberTypeString(ITypeSymbol valueTypeSymbol,
        out bool isNullable)
    {
        throw new NotImplementedException();
        // isNullable = false;
        // var valueTypeString = valueTypeSymbol.ToString();
        // //先处理一些特殊类型
        // if (valueTypeString.AsSpan().EndsWith("?")) //nullable
        // {
        //     valueTypeString = valueTypeString.Remove(valueTypeString.Length - 1, 1);
        //     isNullable = true;
        // }
        // else if (valueTypeString.AsSpan().StartsWith(Type_EntityList)) //TODO:暂简单判断
        //     valueTypeString = RuntimeType_EntityList;
        // else if (IsEntityClass(valueTypeSymbol as INamedTypeSymbol))
        //     valueTypeString = RuntimeType_Entity;
        //
        // string type;
        // switch (valueTypeString)
        // {
        //     case "short":
        //         type = "Short";
        //         break;
        //     case "int":
        //         type = "Int";
        //         break;
        //     case "long":
        //         type = "Long";
        //         break;
        //     case "bool":
        //         type = "Bool";
        //         break;
        //     case "byte":
        //         type = "Byte";
        //         break;
        //     case "float":
        //         type = "Float";
        //         break;
        //     case "double":
        //         type = "Double";
        //         break;
        //     case "decimal":
        //         type = "Decimal";
        //         break;
        //     case "System.Guid":
        //     case "Guid":
        //         type = "Guid";
        //         break;
        //     case "System.DateTime":
        //     case "DateTime":
        //         type = "DateTime";
        //         break;
        //     case "byte[]":
        //         type = "Bytes";
        //         break;
        //     case "string":
        //         type = "String";
        //         break;
        //     case "EntityId":
        //         type = "EntityId";
        //         break;
        //     case RuntimeType_Entity:
        //         type = "EntityRef";
        //         break;
        //     case RuntimeType_EntityList:
        //         type = "EntitySet";
        //         break;
        //     default: //other enum
        //         type = "Int32";
        //         break;
        // }
        //
        // return type;
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
}