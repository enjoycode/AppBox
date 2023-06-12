using AppBoxClient;
using PixUI;

namespace AppBox.BlazorApp;

public sealed class IndexPage : SingleChildWidget
{
    private readonly Navigator _navigator;

    public IndexPage()
    {
        var routes = new List<Route>
        {
            new("dev", s => new AppBoxDesign.HomePage()),
            new("home", s => new FutureBuilder<Widget>(
                LoadHomePage(),
                ((widget, exception) => widget))),
        };
        _navigator = new Navigator(routes);

        Child = new RouteView(_navigator);
    }

    private static async Task<Widget> LoadHomePage() =>
        await AppAssembiles.MakeViewWidgetAsync("sys.HomePage");
}