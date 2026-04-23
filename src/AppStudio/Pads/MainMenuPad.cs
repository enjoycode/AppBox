using PixUI;

namespace AppBoxDesign;

internal sealed class MainMenuPad : View
{
    public MainMenuPad(DesignHub designContext)
    {
        var designStore = (DesignStore)designContext.DesignUIService;

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

    private static MenuItem[] BuildMenuItems(Commands cmds) =>
    [
        MenuItem.SubMenu("DataStore", MaterialIcons.Dns, [
            MenuItem.Item("Add DataStore", null, cmds.NotImplCommand),
            MenuItem.Item("Remove DataStore", null, cmds.NotImplCommand)
        ]),
        MenuItem.SubMenu("New", MaterialIcons.CreateNewFolder, [
            MenuItem.Item("Application", MaterialIcons.Widgets, cmds.NewAppCommand.Execute),
            MenuItem.Item("Folder", MaterialIcons.Folder, cmds.NewFolderCommand.Execute),
            MenuItem.Item("Entity", MaterialIcons.TableChart, cmds.NewEntityCommand.Execute),
            MenuItem.Item("Service", MaterialIcons.Settings, cmds.NewServiceCommand.Execute),
            MenuItem.Item("View", MaterialIcons.Wysiwyg, cmds.NewViewCommand.Execute),
            MenuItem.Item("Report", MaterialIcons.PieChart, cmds.NewReportCommand.Execute),
            MenuItem.Item("Enum", MaterialIcons.ViewList, cmds.NewEnumCommand.Execute),
            MenuItem.Item("Permission", MaterialIcons.Lock, cmds.NewPermissionCommand.Execute)
        ]),
        MenuItem.SubMenu("Models", MaterialIcons.Widgets, [
            MenuItem.Item("Save", MaterialIcons.Save, cmds.SaveCommand.Execute),
            MenuItem.Item("Checkout", MaterialIcons.CheckCircle, cmds.CheckoutCommand.Execute),
            MenuItem.Item("Usages", MaterialIcons.Link, cmds.UsagesCommand.Execute),
            MenuItem.Item("Dependency", MaterialIcons.Lan, cmds.DependencyCommand.Execute),
            MenuItem.Item("Rename", MaterialIcons.DriveFileRenameOutline, cmds.RenameCommand.Execute),
            MenuItem.Item("Delete", MaterialIcons.DeleteForever, cmds.DeleteCommand.Execute),
            MenuItem.Item("Publish", MaterialIcons.Publish, cmds.PublishCommand.Execute)
        ]),
        MenuItem.SubMenu("Apps", MaterialIcons.Apps, [
            MenuItem.Item("Build", MaterialIcons.Build, cmds.BuildAppCommand.Execute),
            MenuItem.Item("Export", MaterialIcons.Upload, cmds.ExportCommand.Execute),
            MenuItem.Item("Import", MaterialIcons.Download, cmds.ImportCommand.Execute)
        ]),
        MenuItem.Item("Tools", MaterialIcons.Handyman),
        MenuItem.Item("AppStore", MaterialIcons.Store),
        MenuItem.Item("About", MaterialIcons.Help)
    ];
}