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
                MenuItem.SubMenu("DataStore", Icons.Filled.Dns, new MenuItem[]
                {
                    MenuItem.Item("Add DataStore", null, Commands.NotImplCommand),
                    MenuItem.Item("Remove DataStore", null, Commands.NotImplCommand),
                }),
                MenuItem.SubMenu("New", Icons.Filled.CreateNewFolder, new MenuItem[]
                {
                    MenuItem.Item("Application", Icons.Filled.Widgets, Commands.NotImplCommand),
                    MenuItem.Item("Folder", Icons.Filled.Folder, Commands.NotImplCommand),
                    MenuItem.Item("Entity", Icons.Filled.TableChart, Commands.NotImplCommand),
                    MenuItem.Item("Service", Icons.Filled.Settings, Commands.NewServiceCommand),
                    MenuItem.Item("View", Icons.Filled.Window, Commands.NewViewCommand),
                    MenuItem.Item("Report", Icons.Filled.PieChart, Commands.NotImplCommand),
                    MenuItem.Item("Enum", Icons.Filled.Bolt, Commands.NotImplCommand),
                    MenuItem.Item("Permission", Icons.Filled.Lock, Commands.NotImplCommand),
                }),
                MenuItem.SubMenu("Models", Icons.Filled.Widgets, new MenuItem[]
                {
                    MenuItem.Item("Save", Icons.Filled.Save, Commands.SaveCommand),
                    MenuItem.Item("Checkout", Icons.Filled.CheckCircle, Commands.CheckoutCommand),
                    MenuItem.Item("Delete", Icons.Filled.DeleteForever, Commands.NotImplCommand),
                    MenuItem.Item("Publish", Icons.Filled.Publish, Commands.PublishCommand),
                }),
                MenuItem.Item("Tools", Icons.Filled.Handyman),
                MenuItem.Item("AppStore", Icons.Filled.Store),
                MenuItem.Item("About", Icons.Filled.Help),
            };
        }
    }
}