using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal static class IconUtil
{
    internal static IconData GetIconForModelType(ModelType modelType)
    {
        switch (modelType)
        {
            case ModelType.Entity: return Icons.Filled.TableChart;
            case ModelType.Service: return Icons.Filled.Settings;
            case ModelType.View: return Icons.Filled.Wysiwyg;
            case ModelType.Report: return Icons.Filled.PieChart;
            case ModelType.Enum: return Icons.Filled.ViewList;
            case ModelType.Permission: return Icons.Filled.Lock;
            default: return Icons.Filled.TableChart;
        }
    }
}