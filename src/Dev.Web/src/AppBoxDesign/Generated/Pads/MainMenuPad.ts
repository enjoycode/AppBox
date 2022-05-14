import * as PixUI from '@/PixUI'

export class MainMenuPad extends PixUI.View {
    private readonly _bgColor: PixUI.Color = new PixUI.Color(43, 49, 56);

    public constructor() {
        super();
        this.Child = new PixUI.Container
        ().Init({
            Height: PixUI.State.op_Implicit_From(45),
            Color: PixUI.State.op_Implicit_From(this._bgColor),
            Child: new PixUI.Row
            ().Init({
                    Children: [new PixUI.Container().Init({Width: PixUI.State.op_Implicit_From(50)}), new PixUI.Expanded
                    ().Init({
                        Child: new PixUI.MainMenu(this.BuildMenuItems()).Init({
                                BackgroudColor: (this._bgColor).Clone(),
                                Color: (PixUI.Colors.White).Clone()
                            }
                        )
                    })]
                }
            )
        });
    }

    private BuildMenuItems(): PixUI.MenuItem[] {
        return [PixUI.MenuItem.SubMenu("DataStore", (PixUI.Icons.Filled.Dns).Clone(), [PixUI.MenuItem.Item("Add DataStore"), PixUI.MenuItem.Item("Remove DataStore")]), PixUI.MenuItem.SubMenu("New", (PixUI.Icons.Filled.CreateNewFolder).Clone(), [PixUI.MenuItem.Item("Application", (PixUI.Icons.Filled.Widgets).Clone()), PixUI.MenuItem.Item("Folder", (PixUI.Icons.Filled.Folder).Clone()), PixUI.MenuItem.Item("Entity", (PixUI.Icons.Filled.TableChart).Clone()), PixUI.MenuItem.Item("Service", (PixUI.Icons.Filled.Settings).Clone()), PixUI.MenuItem.Item("Report", (PixUI.Icons.Filled.PieChart).Clone()), PixUI.MenuItem.Item("Enum", (PixUI.Icons.Filled.Bolt).Clone()), PixUI.MenuItem.Item("Permission", (PixUI.Icons.Filled.Lock).Clone())]), PixUI.MenuItem.SubMenu("Models", (PixUI.Icons.Filled.Widgets).Clone(), [PixUI.MenuItem.Item("Save", (PixUI.Icons.Filled.Save).Clone()), PixUI.MenuItem.Item("Checkout", (PixUI.Icons.Filled.CheckCircle).Clone()), PixUI.MenuItem.Item("Delete", (PixUI.Icons.Filled.DeleteForever).Clone()), PixUI.MenuItem.Item("Publish", (PixUI.Icons.Filled.Publish).Clone())]), PixUI.MenuItem.Item("Tools", (PixUI.Icons.Filled.Handyman).Clone()), PixUI.MenuItem.Item("AppStore", (PixUI.Icons.Filled.Store).Clone()), PixUI.MenuItem.Item("About", (PixUI.Icons.Filled.Help).Clone())];
    }

    public Init(props: Partial<MainMenuPad>): MainMenuPad {
        Object.assign(this, props);
        return this;
    }
}
