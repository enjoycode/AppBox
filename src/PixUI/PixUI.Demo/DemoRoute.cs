using System.Collections.Generic;

namespace PixUI.Demo
{
    public sealed class DemoRoute : View
    {
        private readonly Navigator _navigator;

        public DemoRoute(IList<Route> routes)
        {
            _navigator = new Navigator(routes);

            Child = new Column(debugLabel: "DemoRouteColumn")
            {
                Children = new[]
                {
                    BuildMainMenu(),
                    new Expanded(new RouteView(_navigator)) { DebugLabel = "RouteView" }
                }
            };

            // var ts = new TextStyle { FontSize = 14 };
            // var ps = new ParagraphStyle { MaxLines = 1, TextAlign = TextAlign.Left};
            // var pb = new ParagraphBuilder(ps);
            // pb.PushStyle(ts);
            // pb.AddText("Hello  ");
            // var ph = pb.Build();
            // ph.Layout(2000);
            // Console.WriteLine($"{ph.Width} {ph.LongestLine}");
        }

        private Widget BuildMainMenu()
        {
            return new Container //TODO: remove Container
            {
                Child = new MainMenu(BuildMenuItems()),
                Height = 36,
                BgColor = new Color(200, 200, 200),
            };
        }

        private MenuItem[] BuildMenuItems()
        {
            return new MenuItem[]
            {
                MenuItem.SubMenu("Route", Icons.Filled.Map, new MenuItem[]
                {
                    MenuItem.Item("Back", Icons.Filled.ArrowBack, action: _navigator.Pop),
                    MenuItem.Item("Forward", Icons.Filled.ArrowForward, null),
                }),
                MenuItem.SubMenu("Debug", Icons.Filled.BugReport, new MenuItem[]
                {
                    MenuItem.Item("Outline", null, PaintDebugger.Switch),
                    MenuItem.SubMenu("Help", Icons.Filled.HelpOutline, new MenuItem[]
                    {
                        MenuItem.Item("About"),
                        MenuItem.Item("Window")
                    }),
                }),
                MenuItem.Item("Form", null, () => _navigator.PushNamed("form")),
                MenuItem.Item("Animation", null, () => _navigator.PushNamed("animation")),
                MenuItem.Item("ListView", null, () => _navigator.PushNamed("list")),
                MenuItem.Item("Transform", null, () => _navigator.PushNamed("transform")),
                MenuItem.Item("TabView", null, () => _navigator.PushNamed("tabview")),
                MenuItem.Item("TreeView",
                    Icons.Filled.AccountTree, () => _navigator.PushNamed("treeView")),
                MenuItem.Item("DataGrid",
                    Icons.Filled.TableView, () => _navigator.PushNamed("datagrid")),
                MenuItem.Item("CodeEditor",
                    Icons.Filled.Edit, () => _navigator.PushNamed("codeEditor")),
            };
        }
    }
}