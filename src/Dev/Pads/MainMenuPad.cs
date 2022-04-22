using PixUI;

namespace AppBoxDev
{
    internal sealed class MainMenuPad : View
    {
        private readonly Color _bgColor = new Color(43, 49, 56);

        public MainMenuPad()
        {
            Child = new Container
            {
                Height = 45, Color = _bgColor,
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

        private MenuItem[] BuildMenuItems()
        {
            return new MenuItem[]
            {
                MenuItem.SubMenu("DataStore", Icons.Filled.Dns, new MenuItem[]
                {
                    MenuItem.Item("Add DataStore"),
                    MenuItem.Item("Remove DataStore"),
                }),
                MenuItem.SubMenu("New", Icons.Filled.CreateNewFolder, new MenuItem[]
                {
                    MenuItem.Item("Application", Icons.Filled.Widgets),
                    MenuItem.Item("Folder", Icons.Filled.Folder),
                    MenuItem.Item("Entity", Icons.Filled.TableChart),
                    MenuItem.Item("Service", Icons.Filled.Settings),
                    MenuItem.Item("Report", Icons.Filled.PieChart),
                    MenuItem.Item("Enum", Icons.Filled.Bolt),
                    MenuItem.Item("Permission", Icons.Filled.Lock),
                }),
                MenuItem.SubMenu("Models", Icons.Filled.Widgets, new MenuItem[]
                {
                    MenuItem.Item("Save", Icons.Filled.Save),
                    MenuItem.Item("Checkout", Icons.Filled.CheckCircle),
                    MenuItem.Item("Delete", Icons.Filled.DeleteForever),
                    MenuItem.Item("Publish", Icons.Filled.Publish),
                }),
                MenuItem.Item("Tools", Icons.Filled.Handyman),
                MenuItem.Item("AppStore", Icons.Filled.Store),
                MenuItem.Item("About", Icons.Filled.Help),
            };
        }
    }
}