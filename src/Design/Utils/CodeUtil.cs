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
}