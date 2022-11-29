import * as System from '@/System'
import * as PixUI from '@/PixUI'

export enum MenuItemType {
    MenuItem,
    SubMenu,
    Divider
}

export class MenuItem {
    #Type: MenuItemType = 0;
    public get Type() {
        return this.#Type;
    }

    private set Type(value) {
        this.#Type = value;
    }

    public readonly Icon: Nullable<PixUI.IconData>;
    public readonly Label: Nullable<string>;
    public Enabled: boolean = false;
    public readonly Action: Nullable<System.Action>; //only for menu item

    #Children: Nullable<System.IList<MenuItem>>;
    public get Children() {
        return this.#Children;
    }

    private set Children(value) {
        this.#Children = value;
    }

    //public readonly string? Shortcut;

    public static Item(label: string, icon: Nullable<PixUI.IconData> = null, action: Nullable<System.Action> = null): MenuItem {
        return new MenuItem(MenuItemType.MenuItem, label, icon, action);
    }

    public static SubMenu(label: string, icon: Nullable<PixUI.IconData>, children: MenuItem[]): MenuItem {
        return new MenuItem(MenuItemType.SubMenu, label, icon, null, children);
    }

    public static Divider(): MenuItem {
        return new MenuItem(MenuItemType.Divider);
    }

    private constructor(type: MenuItemType, label: Nullable<string> = null, icon: Nullable<PixUI.IconData> = null,
                        action: Nullable<System.Action> = null, children: Nullable<MenuItem[]> = null, enabled: boolean = true) {
        this.Type = type;
        this.Label = label;
        this.Icon = icon;
        this.Action = action;
        this.Children = new System.List<MenuItem>(children);

        this.Enabled = enabled;
    }
}
