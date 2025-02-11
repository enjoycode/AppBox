using AppBoxClient;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Microsoft.JSInterop;
using PixUI;
using PixUI.Platform.Blazor;

namespace AppBox.BlazorApp;

public static class Program
{
    public static async Task Main(string[] args)
    {
        var builder = WebAssemblyHostBuilder.CreateDefault(args);
        builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });

        var host = builder.Build();
        BlazorApplication.JSRuntime = host.Services.GetRequiredService<IJSRuntime>();
        BlazorApplication.HttpClient = host.Services.GetService<HttpClient>()!;

        await host.RunAsync();
    }

    [JSInvokable]
    public static async Task Run(string wsurl, int glHandle, int width, int height, float ratio,
        string? routePath, bool isMacOS)
    {
        //初始化通讯
        Channel.Init(new WebSocketChannel(new Uri(wsurl)));

        //初始化默认字体
        await using var fontDataStream =
            await BlazorApplication.HttpClient.GetStreamAsync("/fonts/MiSans-Regular.woff2");
        using var fontData = SKData.Create(fontDataStream);
        FontCollection.Instance.RegisterTypefaceToAsset(fontData!, FontCollection.DefaultFamilyName, false);

        //加载HomePage
        //var homePage = new HomePage();
        var homePage = await AppAssembiles.MakeViewWidgetAsync("sys.HomePage");
        // ReSharper disable once SuspiciousTypeConversion.Global
        // if (homePage is IHomePage mainRoutes)
        // {
        //     var devRoute = new Route("dev", s => new AppBoxDesign.HomePage());
        //     mainRoutes.InjectRoute(devRoute);
        // }

        BlazorApplication.Run(() => homePage, glHandle, width, height, ratio, routePath, isMacOS);
    }
}

// public class HomePage : RouteView
// {
//     private static readonly Navigator _navigator = new(new RouteBase[]
//     {
//         new Route("welcome", a => new Center() { Child = new Text("Welcome")}),
//         new Route("db", a => new Center() {Child = new Text("Dashboard")}),
//         new Route("biz", a => new BizHomePage())
//     });
//     
//     public HomePage() : base(_navigator) { }
//
//     public Navigator Navigator => _navigator;
// }
//
// public class BizHomePage : View
// {
//     public BizHomePage()
//     {
//         var navigator = new Navigator(new RouteBase[]
//         {
//             new Route("welcome", a => new Center() {Child = new Text("Welcome to Biz")}),
//         });
//         
//         Child = new Column
//         {
//             Children =
//             {
//                 new Row
//                 {
//                     Children =
//                     {
//                         new Button("大屏") {OnTap = GotoDB}
//                     }
//                 },
//                 new Expanded(new RouteView(navigator))
//             }
//         };
//     }
//
//     private void GotoDB(PointerEvent e)
//     {
//         // var homePage = (HomePage) (((SingleChildWidget)Root!).Child!);
//         // homePage.Navigator.Push("db");
//         Root?.Window.NavigateTo("/db");
//     }
// }