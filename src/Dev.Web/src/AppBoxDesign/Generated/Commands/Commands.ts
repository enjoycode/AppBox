import * as PixUI from '@/PixUI'
import * as AppBoxDesign from '@/AppBoxDesign'
import * as System from '@/System'

export class Commands {
    public static readonly NewViewCommand: System.Action = () =>
        new AppBoxDesign.NewDialog(PixUI.UIWindow.Current.Overlay, "View").Show();
}
