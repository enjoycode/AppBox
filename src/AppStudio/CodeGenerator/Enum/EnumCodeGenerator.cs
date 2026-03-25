using AppBoxCore;

namespace AppBoxDesign;

internal static class EnumCodeGenerator
{
    internal static string GenEnumCode(EnumModel model, string appName)
    {
        var sb = StringBuilderCache.Acquire();

        sb.Append($"namespace {appName}.Enums {{\n");
        if (!string.IsNullOrEmpty(model.Comment))
        {
            sb.Append("/// <summary>\n");
            sb.Append($"/// {model.Comment}\n");
            sb.Append("/// </summary>\n");
        }

        if (model.IsFlag) sb.Append("[Flags]\n");

        sb.Append($"public enum {model.Name} {{\n");
        for (var i = 0; i < model.Items.Count; i++)
        {
            if (i != 0) sb.Append(',');
            sb.Append($"{model.Items[i].Name}={model.Items[i].Value}");
        }

        sb.Append("}}");

        return StringBuilderCache.GetStringAndRelease(sb);
    }
}