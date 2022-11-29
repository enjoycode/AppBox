import * as PixUI from '@/PixUI'
/// <summary>
/// 右键菜单
/// </summary>
export class ContextMenu {
    public static Show(menuItems: PixUI.MenuItem[]) {
        let controller = new PixUI.MenuController();
        controller.ShowContextMenu(menuItems);
    }
}

