using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal static class IconUtil
{
    internal static IconData GetIconForModelType(ModelType modelType)
    {
        switch (modelType)
        {
            case ModelType.Entity: return MaterialIcons.TableChart;
            case ModelType.Service: return MaterialIcons.Settings;
            case ModelType.View: return MaterialIcons.Wysiwyg;
            case ModelType.Report: return MaterialIcons.PieChart;
            case ModelType.Enum: return MaterialIcons.ViewList;
            case ModelType.Permission: return MaterialIcons.Lock;
            default: return MaterialIcons.TableChart;
        }
    }
}