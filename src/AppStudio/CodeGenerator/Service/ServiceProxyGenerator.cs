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

            // 判断是否上传或下载方法
            var isUploadMethod = IsUploadMethod(method);
            var isDownloadMethod = IsDownloadMethod(method);
            if (isUploadMethod && isDownloadMethod)
                throw new NotSupportedException("Can't be both Download and Upload method.");
            if (isUploadMethod)
                sb.Append("[UploadMethod]\n");
            if (isDownloadMethod)
                sb.Append("[DownloadMethod]\n");

            // method declaration
            sb.Append("public static ");
            var isReturnVoid = method.IsReturnVoid();
            var isReturnTask = !isReturnVoid && method.IsReturnTask();
            //非异步方法转换为异步
            if (isReturnVoid || isDownloadMethod)
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
            
            //下载方法添加第一个Stream类型的参数
            if (isDownloadMethod)
                sb.Append("System.IO.Stream toStream,");

            for (var i = 0; i < method.ParameterList.Parameters.Count; i++)
            {
                if (i != 0) sb.Append(',');

                if (i == 0 && isUploadMethod) 
                {
                    //上传方法需要转换第一个参数的类型为Stream
                    sb.Append("System.IO.Stream ");
                    sb.Append(method.ParameterList.Parameters[i].Identifier.ValueText);
                }
                else
                {
                    sb.Append(method.ParameterList.Parameters[i]);
                }
            }

            sb.Append(") => throw new Exception();\n");
        }

        sb.Append('}');
        return StringBuilderCache.GetStringAndRelease(sb);
    }

    private static bool IsUploadMethod(MethodDeclarationSyntax method)
    {
        var attribute = TypeHelper.TryGetAttribute(method.AttributeLists, static a =>
        {
            const string shortName = "UploadMethod";
            var name = a.Name.ToString();
            if (name == shortName) return true;

            return name is $"{shortName}Attribute" or $"AppBoxCore.{shortName}" or $"AppBoxCore.{shortName}Attribute";
        });
        return attribute != null;
    }

    private static bool IsDownloadMethod(MethodDeclarationSyntax method)
    {
        var attribute = TypeHelper.TryGetAttribute(method.AttributeLists, static a =>
        {
            const string shortName = "DownloadMethod";
            var name = a.Name.ToString();
            if (name == shortName) return true;

            return name is $"{shortName}Attribute" or $"AppBoxCore.{shortName}" or $"AppBoxCore.{shortName}Attribute";
        });
        return attribute != null;
    }
}