import * as PixUI from '@/PixUI'
import * as AppBoxCore from '@/AppBoxCore'

export class IconUtil {
    public static GetIconForModelType(modelType: AppBoxCore.ModelType): PixUI.IconData {
        switch (modelType) {
            case AppBoxCore.ModelType.Entity:
                return PixUI.Icons.Filled.TableChart;
            case AppBoxCore.ModelType.Service:
                return PixUI.Icons.Filled.Settings;
            case AppBoxCore.ModelType.View:
                return PixUI.Icons.Filled.Wysiwyg;
            case AppBoxCore.ModelType.Report:
                return PixUI.Icons.Filled.PieChart;
            case AppBoxCore.ModelType.Enum:
                return PixUI.Icons.Filled.ViewList;
            case AppBoxCore.ModelType.Permission:
                return PixUI.Icons.Filled.Lock;
            default:
                return PixUI.Icons.Filled.TableChart; //TODO: others
        }
    }
}
