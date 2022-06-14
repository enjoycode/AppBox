using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

internal static class TypeHelper
{
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

    private static readonly Dictionary<string, TypeSyntax> realTypes =
        new Dictionary<string, TypeSyntax>();

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
}