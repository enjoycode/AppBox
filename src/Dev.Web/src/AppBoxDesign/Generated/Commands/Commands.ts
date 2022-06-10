import * as PixUI from '@/PixUI'
import * as AppBoxDesign from '@/AppBoxDesign'
import * as System from '@/System'

export class Commands {
    public static readonly NewViewCommand: System.Action = () =>
        new AppBoxDesign.NewDialog(PixUI.UIWindow.Current.Overlay, "View").Show();

    public static readonly SaveCommand: System.Action = () => Commands.Save();

    private static async Save(): System.Task {
        let selectedIndex = AppBoxDesign.DesignStore.DesignerController.SelectedIndex;
        if (selectedIndex < 0)
            return;

        let designer = AppBoxDesign.DesignStore.DesignerController.DataSource[selectedIndex].Designer!;
        await designer.SaveAsync();
    }
}
