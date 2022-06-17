using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

public static class SyntaxExtensions
{
    public static bool IsReturnVoid(this MethodDeclarationSyntax methodDeclaration)
    {
        return methodDeclaration.ReturnType.ToString() == "void";
    }

    public static bool IsReturnTask(this MethodDeclarationSyntax methodDeclaration)
    {
        //TODO: 暂简单实现
        var returnType = methodDeclaration.ReturnType.ToString();
        return returnType.Contains("Task<", StringComparison.Ordinal) ||
               returnType.Contains("ValueTask<", StringComparison.Ordinal) ||
               returnType.EndsWith("Task") ||
               returnType.EndsWith("ValueTask");
    }
}