import * as PixUI from '@/PixUI'

export class ContextMenu {
    public static Show(menuItems: PixUI.MenuItem[]) {
        let controller = new PixUI.MenuController();
        controller.ShowContextMenu(menuItems);
    }
}

