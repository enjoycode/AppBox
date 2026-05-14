using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal static class IconUtil
{
    internal static IconData GetIconForModelType(ModelType modelType) => modelType switch
    {
        ModelType.Entity => MaterialIcons.TableChart,
        ModelType.Service => MaterialIcons.Settings,
        ModelType.View => MaterialIcons.Wysiwyg,
        ModelType.Report => MaterialIcons.PieChart,
        ModelType.Workflow => MaterialIcons.DeviceHub,
        ModelType.Enum => MaterialIcons.ViewList,
        ModelType.Permission => MaterialIcons.Lock,
        _ => MaterialIcons.TableChart
    };
}