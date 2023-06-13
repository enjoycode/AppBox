namespace sys.Views;

public sealed class HomePage : RouteView, IHomePage
{
    private static readonly Navigator _navigator = new(new Route[]
    {
        new ("Welcome", s => new Center { Child = new Text("Hello AppBox") { FontSize = 50} }),
    });

    public HomePage() : base(_navigator) { }

    public void InjectRoute(RouteBase route) => _navigator.AddRoute(route);
}