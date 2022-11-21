using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal static class IconUtil
{
    internal static IconData GetIconForModelType(ModelType modelType)
    {
        return modelType switch
        {
            ModelType.Entity => Icons.Filled.TableChart,
            ModelType.Service => Icons.Filled.Settings,
            ModelType.View => Icons.Filled.Wysiwyg,
            ModelType.Report => Icons.Filled.PieChart,
            ModelType.Enum => Icons.Filled.ViewList,
            ModelType.Permission => Icons.Filled.Lock,
            _ => Icons.Filled.TableChart
        };
    }
}