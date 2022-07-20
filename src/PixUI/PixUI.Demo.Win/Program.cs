using PixUI;
using PixUI.Demo.Mac;
using PixUI.Demo;
using PixUI.Platform.Win;

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

WinApplication.Run(new DemoRoute(routes));

static Widget BuildDefaultTransition(Animation<double> animation, Widget child)
{
    var offsetAnimation =
        new OffsetTween(new Offset(1, 0), new Offset(0, 0)).Animate(animation);

    return new SlideTransition(offsetAnimation)
    {
        Child = new Container { Child = child, BgColor = Colors.White }
    };
}