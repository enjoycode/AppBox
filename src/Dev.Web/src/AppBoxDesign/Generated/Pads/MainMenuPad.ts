import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export class MainMenuPad extends PixUI.View {
    private readonly _bgColor: PixUI.Color = new PixUI.Color(43, 49, 56);

    public constructor() {
        super();
        this.Child = new PixUI.Container().Init(
            {
                Height: PixUI.State.op_Implicit_From(45),
                BgColor: PixUI.State.op_Implicit_From(this._bgColor),
                Child: new PixUI.Row().Init(
                    {
                        Children: [new PixUI.Container().Init({Width: PixUI.State.op_Implicit_From(50)}), new PixUI.Expanded().Init(
                            {
                                Child: new PixUI.MainMenu(MainMenuPad.BuildMenuItems()).Init(
                                    {BackgroudColor: this._bgColor, Color: PixUI.Colors.White})
                            })]
                    })
            });
    }

    private static BuildMenuItems(): PixUI.MenuItem[] {
        return [PixUI.MenuItem.SubMenu("DataStore", PixUI.Icons.Filled.Dns, [PixUI.MenuItem.Item("Add DataStore", null, AppBoxDesign.Commands.NotImplCommand), PixUI.MenuItem.Item("Remove DataStore", null, AppBoxDesign.Commands.NotImplCommand)]), PixUI.MenuItem.SubMenu("New", PixUI.Icons.Filled.CreateNewFolder, [PixUI.MenuItem.Item("Application", PixUI.Icons.Filled.Widgets, AppBoxDesign.Commands.NotImplCommand), PixUI.MenuItem.Item("Folder", PixUI.Icons.Filled.Folder, AppBoxDesign.Commands.NotImplCommand), PixUI.MenuItem.Item("Entity", PixUI.Icons.Filled.TableChart, AppBoxDesign.Commands.NotImplCommand), PixUI.MenuItem.Item("Service", PixUI.Icons.Filled.Settings, AppBoxDesign.Commands.NewServiceCommand), PixUI.MenuItem.Item("View", PixUI.Icons.Filled.Window, AppBoxDesign.Commands.NewViewCommand), PixUI.MenuItem.Item("Report", PixUI.Icons.Filled.PieChart, AppBoxDesign.Commands.NotImplCommand), PixUI.MenuItem.Item("Enum", PixUI.Icons.Filled.Bolt, AppBoxDesign.Commands.NotImplCommand), PixUI.MenuItem.Item("Permission", PixUI.Icons.Filled.Lock, AppBoxDesign.Commands.NotImplCommand)]), PixUI.MenuItem.SubMenu("Models", PixUI.Icons.Filled.Widgets, [PixUI.MenuItem.Item("Save", PixUI.Icons.Filled.Save, AppBoxDesign.Commands.SaveCommand), PixUI.MenuItem.Item("Checkout", PixUI.Icons.Filled.CheckCircle, AppBoxDesign.Commands.CheckoutCommand), PixUI.MenuItem.Item("Delete", PixUI.Icons.Filled.DeleteForever, AppBoxDesign.Commands.NotImplCommand), PixUI.MenuItem.Item("Publish", PixUI.Icons.Filled.Publish, AppBoxDesign.Commands.PublishCommand)]), PixUI.MenuItem.Item("Tools", PixUI.Icons.Filled.Handyman), PixUI.MenuItem.Item("AppStore", PixUI.Icons.Filled.Store), PixUI.MenuItem.Item("About", PixUI.Icons.Filled.Help)];
    }

    public Init(props: Partial<MainMenuPad>): MainMenuPad {
        Object.assign(this, props);
        return this;
    }
}
