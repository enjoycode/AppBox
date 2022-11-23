import * as PixUI from '@/PixUI'

export class MenuController {
    public readonly TextColor: PixUI.State<PixUI.Color> = PixUI.State.op_Implicit_From(PixUI.Colors.Black);

    public get ItemPadding(): PixUI.EdgeInsets {
        return PixUI.EdgeInsets.Only(8, 5, 8, 5);
    }

    public get PopupItemHeight(): number {
        return 30;
    }

    public BackgroundColor: PixUI.Color = new PixUI.Color(200, 200, 200);

    public set Color(value: PixUI.Color) {
        this.TextColor.Value = value;
    }

    public HoverColor: PixUI.Color = PixUI.Theme.AccentColor;

    public HoverTextColor: PixUI.Color = PixUI.Colors.White;

    private _popupMenuStack: Nullable<PixUI.PopupMenuStack>;

    public OnMenuItemHoverChanged(item: PixUI.MenuItemWidget, hover: boolean) {
        if (hover) {
            //尝试关闭之前打开的
            if (this._popupMenuStack != null) {
                if (this._popupMenuStack.TryCloseSome(item))
                    return;
            }

            //尝试打开子菜单
            if (item.MenuItem.Type == PixUI.MenuItemType.SubMenu) {
                this._popupMenuStack ??= new PixUI.PopupMenuStack(item.Overlay!, this.CloseAll.bind(this));

                let popupMenu = new PixUI.PopupMenu(item, item.Depth + 1, this);
                let relativeToWinPt = item.LocalToWindow(0, 0);
                // var relativeBounds =
                //     Rect.FromLTWH(relativeToWinPt.X, relativeToWinPt.Y, item.W, item.H);
                //TODO:计算弹出位置
                if (item.Parent instanceof PixUI.PopupMenu)
                    popupMenu.SetPosition(relativeToWinPt.X + item.W, relativeToWinPt.Y);
                else
                    popupMenu.SetPosition(relativeToWinPt.X, relativeToWinPt.Y + item.H);
                popupMenu.Layout(item.Root!.Window.Width, item.Root.Window.Height);

                this._popupMenuStack.Add(popupMenu);
            }

            //如果没有打开的子菜单，移除整个PopupStack
            if (this._popupMenuStack != null && !this._popupMenuStack.HasChild)
                this.CloseAll();
        }
    }

    public CloseAll() {
        this._popupMenuStack?.Hide();
        this._popupMenuStack = null;
    }
}
