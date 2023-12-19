using PixUI;

namespace AppBoxDesign;

internal sealed class MainMenuPad : View
{
    public MainMenuPad(DesignStore designStore)
    {
        Child = new Container
        {
            Height = 45, FillColor = _bgColor,
            Child = new Row
            {
                Children =
                {
                    new Container { Width = 50 },
                    new Expanded
                    {
                        Child = new MainMenu(BuildMenuItems(designStore.Commands))
                            { BackgroudColor = _bgColor, Color = Colors.White }
                    },
                }
            }
        };
    }

    private readonly Color _bgColor = new(43, 49, 56);

    private static MenuItem[] BuildMenuItems(Commands cmds)
    {
        return new[]
        {
            MenuItem.SubMenu("DataStore", MaterialIcons.Dns, new[]
            {
                MenuItem.Item("Add DataStore", null, cmds.NotImplCommand),
                MenuItem.Item("Remove DataStore", null, cmds.NotImplCommand),
            }),
            MenuItem.SubMenu("New", MaterialIcons.CreateNewFolder, new[]
            {
                MenuItem.Item("Application", MaterialIcons.Widgets, cmds.NotImplCommand),
                MenuItem.Item("Folder", MaterialIcons.Folder, cmds.NewFolderCommand),
                MenuItem.Item("Entity", MaterialIcons.TableChart, cmds.NewEntityCommand),
                MenuItem.Item("Service", MaterialIcons.Settings, cmds.NewServiceCommand),
                MenuItem.Item("View", MaterialIcons.Wysiwyg, cmds.NewViewCommand),
                MenuItem.Item("Report", MaterialIcons.PieChart, cmds.NotImplCommand),
                MenuItem.Item("Enum", MaterialIcons.ViewList, cmds.NotImplCommand),
                MenuItem.Item("Permission", MaterialIcons.Lock, cmds.NotImplCommand),
            }),
            MenuItem.SubMenu("Models", MaterialIcons.Widgets, new[]
            {
                MenuItem.Item("Save", MaterialIcons.Save, cmds.SaveCommand),
                MenuItem.Item("Checkout", MaterialIcons.CheckCircle, cmds.CheckoutCommand),
                MenuItem.Item("Rename", MaterialIcons.DriveFileRenameOutline, cmds.RenameCommand),
                MenuItem.Item("Delete", MaterialIcons.DeleteForever, cmds.DeleteCommand),
                MenuItem.Item("Publish", MaterialIcons.Publish, cmds.PublishCommand),
            }),
            MenuItem.SubMenu("Apps", MaterialIcons.Apps, new[]
            {
                MenuItem.Item("Build", MaterialIcons.Build, cmds.BuildAppCommand),
            }),
            MenuItem.Item("Tools", MaterialIcons.Handyman),
            MenuItem.Item("AppStore", MaterialIcons.Store),
            MenuItem.Item("About", MaterialIcons.Help),
        };
    }
}