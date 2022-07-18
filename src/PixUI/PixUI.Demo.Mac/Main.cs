using System.Collections.Generic;
using PixUI.Platform.Mac;

namespace PixUI.Demo.Mac
{
    internal static class MainClass
    {
        private static void Main(string[] args)
        {
            var routes = new List<Route>
            {
                new("page", s => new DemoPage(), BuildDefaultTransition),
                new("form", s => new DemoForm(), BuildDefaultTransition),
                new("list", s => new DemoListView(), BuildDefaultTransition),
                new("animation", s => new DemoAnimation(), BuildDefaultTransition),
                new("transform", s => new DemoTransform(), BuildDefaultTransition),
                new("tabview", s => new DemoTabView(), BuildDefaultTransition),
                new("treeView", s => new DemoTreeView(), BuildDefaultTransition),
                new("datagrid", s => new DemoDataGrid(), BuildDefaultTransition),
                new("codeEditor", s => new DemoCodeEditor(), BuildDefaultTransition),
            };

            var root = new DemoRoute(routes);
            MacApplication.Run(root);
        }

        private static Widget BuildDefaultTransition(Animation<double> animation, Widget child)
        {
            var offsetAnimation =
                new OffsetTween(new Offset(1, 0), new Offset(0, 0)).Animate(animation);

            return new SlideTransition(offsetAnimation)
            {
                Child = new Container { Child = child, BgColor = Colors.White }
            };
        }
    }
}