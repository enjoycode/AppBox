using AppBoxCore;

namespace AppBoxDesign;

internal static class PermissionCodeGenerator
{
    /// <summary>
    /// 生成服务端使用的虚拟代码
    /// </summary>
    internal static string GenServerCode(PermissionModel model, string appName)
    {
        var sb = StringBuilderCache.Acquire();
        sb.Append("namespace ");
        sb.Append(appName);
        sb.Append("{public partial class Permissions {");
        sb.Append('[');
        sb.Append(TypeHelper.MemberAccessInterceptorAttribute);
        sb.Append("(\"");
        sb.Append(PermissionAccessInterceptor.Name);
        sb.Append("\")]");
        sb.Append($"public const bool {model.Name} = false;");
        sb.Append("}}");

        return StringBuilderCache.GetStringAndRelease(sb);
    }

    /// <summary>
    /// 生成客户端使用的虚拟代码
    /// </summary>
    internal static string GenClientCode(PermissionModel model, string appName)
    {
        var sb = StringBuilderCache.Acquire();
        sb.Append("namespace ");
        sb.Append(appName);
        sb.Append(".Permissions {[");
        sb.Append(TypeHelper.PermissionAttribte);
        sb.Append("]public static class ");
        sb.Append(model.Name);
        sb.Append(" {");
        
        sb.Append("public static PixUI.State<bool> State=>null!;");
        sb.Append("public static System.Threading.Tasks.ValueTask<bool> Task=>new ValueTask<bool>(false);");
        
        sb.Append("}}");
        return StringBuilderCache.GetStringAndRelease(sb);
    }
}