using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

internal static class ServiceProxyGenerator
{
    /// <summary>
    /// 生成服务模型的异步代理，用于服务间相互调用
    /// </summary>
    internal static async Task<string> GenServiceProxyCode(Document document, string appName, ServiceModel model)
    {
        var rootNode = await document.GetSyntaxRootAsync();

        //先导入using
        var sb = StringBuilderCache.Acquire();
        sb.Append("using System;\n");
        sb.Append("using System.Linq;\n");
        sb.Append("using System.Collections.Generic;\n");
        sb.Append("using System.Threading.Tasks;\n");
        sb.Append("using AppBoxCore;\n");
        var usings = rootNode!.DescendantNodes().OfType<UsingDirectiveSyntax>().ToArray();
        foreach (var usingDirectiveSyntax in usings)
        {
            sb.Append(usingDirectiveSyntax);
        }

        sb.Append($"\nnamespace {appName}.Services;\n");
        sb.Append("public static class ");
        sb.Append(model.Name);
        sb.Append("{\n");

        var methods = rootNode
            .DescendantNodes().OfType<ClassDeclarationSyntax>().First()
            .DescendantNodes().OfType<MethodDeclarationSyntax>().ToList();

        foreach (var method in methods)
        {
            var isPublic = method.Modifiers.Any(modifier => modifier.ValueText == "public");
            if (!isPublic) continue;

            // interceptor attribute
            sb.Append('[');
            sb.Append(TypeHelper.InvocationInterceptorAttribute);
            sb.Append("(\"");
            sb.Append(CallServiceInterceptor.Name);
            sb.Append("\")]\n");

            // method declaration
            sb.Append("public static ");
            var isReturnVoid = method.IsReturnVoid();
            var isReturnTask = !isReturnVoid && method.IsReturnTask();
            //非异步方法转换为异步
            if (isReturnVoid)
            {
                sb.Append("Task");
            }
            else if (!isReturnTask)
            {
                sb.Append("Task<");
                sb.Append(method.ReturnType);
                sb.Append('>');
            }
            else
            {
                sb.Append(method.ReturnType);
            }

            sb.Append(' ');
            sb.Append(method.Identifier.ValueText);
            sb.Append('(');

            for (var i = 0; i < method.ParameterList.Parameters.Count; i++)
            {
                if (i != 0) sb.Append(',');
                sb.Append(method.ParameterList.Parameters[i]);
            }

            sb.Append(") => throw new Exception();\n");
        }

        sb.Append("}");
        return StringBuilderCache.GetStringAndRelease(sb);
    }
}