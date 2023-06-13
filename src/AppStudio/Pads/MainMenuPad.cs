using PixUI;

namespace AppBoxDesign
{
    internal sealed class MainMenuPad : View
    {
        private readonly Color _bgColor = new Color(43, 49, 56);

        public MainMenuPad()
        {
            Child = new Container
            {
                Height = 45, BgColor = _bgColor,
                Child = new Row
                {
                    Children = new Widget[]
                    {
                        new Container { Width = 50 },
                        new Expanded
                        {
                            Child = new MainMenu(BuildMenuItems())
                                { BackgroudColor = _bgColor, Color = Colors.White }
                        },
                    }
                }
            };
        }

        private static MenuItem[] BuildMenuItems()
        {
            return new MenuItem[]
            {
                MenuItem.SubMenu("DataStore", MaterialIcons.Dns, new MenuItem[]
                {
                    MenuItem.Item("Add DataStore", null, Commands.NotImplCommand),
                    MenuItem.Item("Remove DataStore", null, Commands.NotImplCommand),
                }),
                MenuItem.SubMenu("New", MaterialIcons.CreateNewFolder, new MenuItem[]
                {
                    MenuItem.Item("Application", MaterialIcons.Widgets, Commands.NotImplCommand),
                    MenuItem.Item("Folder", MaterialIcons.Folder, Commands.NotImplCommand),
                    MenuItem.Item("Entity", MaterialIcons.TableChart, Commands.NewEntityCommand),
                    MenuItem.Item("Service", MaterialIcons.Settings, Commands.NewServiceCommand),
                    MenuItem.Item("View", MaterialIcons.Wysiwyg, Commands.NewViewCommand),
                    MenuItem.Item("Report", MaterialIcons.PieChart, Commands.NotImplCommand),
                    MenuItem.Item("Enum", MaterialIcons.ViewList, Commands.NotImplCommand),
                    MenuItem.Item("Permission", MaterialIcons.Lock, Commands.NotImplCommand),
                }),
                MenuItem.SubMenu("Models", MaterialIcons.Widgets, new MenuItem[]
                {
                    MenuItem.Item("Save", MaterialIcons.Save, Commands.SaveCommand),
                    MenuItem.Item("Checkout", MaterialIcons.CheckCircle, Commands.CheckoutCommand),
                    MenuItem.Item("Rename", MaterialIcons.DriveFileRenameOutline,
                        Commands.RenameCommand),
                    MenuItem.Item("Delete", MaterialIcons.DeleteForever, Commands.DeleteCommand),
                    MenuItem.Item("Publish", MaterialIcons.Publish, Commands.PublishCommand),
                }),
                MenuItem.SubMenu("Apps", MaterialIcons.Apps, new MenuItem[]
                {
                    MenuItem.Item("Build", MaterialIcons.Build, Commands.BuildAppCommand),
                }),
                MenuItem.Item("Tools", MaterialIcons.Handyman),
                MenuItem.Item("AppStore", MaterialIcons.Store),
                MenuItem.Item("About", MaterialIcons.Help),
            };
        }
    }
}