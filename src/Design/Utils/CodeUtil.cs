using System.Diagnostics;
using AppBoxCore;

namespace AppBoxDesign;

public static class CodeUtil
{
    /// <summary>
    /// 获取模型类型的复数名称
    /// </summary>
    public static string GetPluralStringOfModelType(ModelType modelType)
    {
        return modelType switch
        {
            ModelType.Enum => "Enums",
            ModelType.Entity => "Entities",
            ModelType.Event => "Events",
            ModelType.Service => "Services",
            ModelType.View => "Views",
            ModelType.Workflow => "Workflows",
            ModelType.Report => "Reports",
            ModelType.Permission => "Permissions",
            _ => throw new NotSupportedException()
        };
    }

    public static ModelType GetModelTypeFromPluralString(ReadOnlySpan<char> typeName)
    {
        return typeName switch
        {
            var s when s.SequenceEqual("Enums") => ModelType.Enum,
            var s when s.SequenceEqual("Entities") => ModelType.Entity,
            var s when s.SequenceEqual("Events") => ModelType.Event,
            var s when s.SequenceEqual("Services") => ModelType.Service,
            var s when s.SequenceEqual("Views") => ModelType.View,
            var s when s.SequenceEqual("Workflows") => ModelType.Workflow,
            var s when s.SequenceEqual("Reports") => ModelType.Report,
            var s when s.SequenceEqual("Permissions") => ModelType.Permission,
            _ => throw new NotSupportedException(typeName.ToString())
        };
    }
}