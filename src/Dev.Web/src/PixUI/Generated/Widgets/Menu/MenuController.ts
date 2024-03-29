import * as PixUI from '@/PixUI'

export class MenuController {
    public readonly TextColor: PixUI.State<PixUI.Color> = PixUI.State.op_Implicit_From(PixUI.Colors.Black);

    #ItemPadding: PixUI.EdgeInsets = PixUI.EdgeInsets.Only(8, 5, 8, 5);
    public get ItemPadding() {
        return this.#ItemPadding;
    }

    private set ItemPadding(value) {
        this.#ItemPadding = value;
    }

    #PopupItemHeight: number = 30;
    public get PopupItemHeight() {
        return this.#PopupItemHeight;
    }

    private set PopupItemHeight(value) {
        this.#PopupItemHeight = value;
    }

    public BackgroundColor: PixUI.Color = new PixUI.Color(200, 200, 200);

    public set Color(value: PixUI.Color) {
        this.TextColor.Value = value;
    }

    public HoverColor: PixUI.Color = PixUI.Theme.AccentColor;

    public HoverTextColor: PixUI.Color = PixUI.Colors.White;

    private _popupMenuStack: Nullable<PixUI.PopupMenuStack>;

    public OnMenuItemHoverChanged(item: PixUI.MenuItemWidget, hover: boolean) {
        if (!hover) return;

        //尝试关闭之前打开的
        if (this._popupMenuStack != null && this._popupMenuStack.TryCloseSome(item))
            return;

        //尝试打开子菜单
        if (item.MenuItem.Type == PixUI.MenuItemType.SubMenu) {
            this._popupMenuStack ??= new PixUI.PopupMenuStack(item.Overlay!, this.CloseAll.bind(this));

            let popupMenu = new PixUI.PopupMenu(item, null, item.Depth + 1, this);
            let relativeToWinPt = item.LocalToWindow(0, 0);
            // var relativeBounds =
            //     Rect.FromLTWH(relativeToWinPt.X, relativeToWinPt.Y, item.W, item.H);
            //TODO:计算弹出位置
            if (item.Parent instanceof PixUI.PopupMenu)
                popupMenu.SetPosition(relativeToWinPt.X + item.W, relativeToWinPt.Y);
            else
                popupMenu.SetPosition(relativeToWinPt.X, relativeToWinPt.Y + item.H);
            let win = item.Root!.Window;
            popupMenu.Layout(win.Width, win.Height);

            this._popupMenuStack.Add(popupMenu);
        }

        //如果没有打开的子菜单，移除整个PopupStack
        if (this._popupMenuStack != null && !this._popupMenuStack.HasChild)
            this.CloseAll();
    }

    public ShowContextMenu(menuItems: PixUI.MenuItem[]) {
        let win = PixUI.UIWindow.Current;
        let winX = win.LastMouseX;
        let winY = win.LastMouseY;

        this._popupMenuStack ??= new PixUI.PopupMenuStack(win.Overlay, this.CloseAll.bind(this));
        let popupMenu = new PixUI.PopupMenu(null, menuItems, 1, this);
        popupMenu.Layout(win.Width, win.Height);
        popupMenu.SetPosition(winX, winY); //TODO: 计算合适的弹出位置
        this._popupMenuStack.Add(popupMenu);
    }

    public CloseAll() {
        this._popupMenuStack?.Hide();
        this._popupMenuStack = null;
    }
}
