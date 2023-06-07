using AppBoxClient;
using Microsoft.AspNetCore.Components.WebAssembly.Services;
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
            new("home", s => AppAssembiles.MakeHomePageWidget()),
        };
        _navigator = new Navigator(routes);

        Child = new RouteView(_navigator);
    }
}