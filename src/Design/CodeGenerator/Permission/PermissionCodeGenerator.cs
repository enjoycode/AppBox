using AppBoxCore;

namespace AppBoxDesign;

internal static class PermissionCodeGenerator
{
    internal static string GenDummyCode(PermissionModel model, string appName)
    {
        var sb = StringBuilderCache.Acquire();
        sb.Append("namespace ");
        sb.Append(appName);
        sb.Append("{public partial class Permissions {");
        sb.Append("[");
        sb.Append(TypeHelper.MemberAccessInterceptorAttribute);
        sb.Append("(\"");
        sb.Append(PermissionAccessInterceptor.Name);
        sb.Append("\")]");
        sb.AppendFormat("public static bool {0};", model.Name);
        sb.Append("}}");

        return StringBuilderCache.GetStringAndRelease(sb);
    }
}