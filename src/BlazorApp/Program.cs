using AppBoxClient;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Microsoft.JSInterop;
using PixUI;
using PixUI.Platform.Blazor;

namespace AppBox.BlazorApp;

public class Program
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
    public static async Task Run(int glHandle, int width, int height, float ratio, string? routePath)
    {
        //初始化通讯
        Channel.Init(new WebSocketChannel(new Uri("ws://localhost:5137/ws"))); //TODO: fix uri
        
        //初始化默认字体
        await using var fontDataStream =
            await BlazorApplication.HttpClient.GetStreamAsync("/fonts/MiSans-Regular.woff2");
        using var fontData = SKData.Create(fontDataStream);
        FontCollection.Instance.RegisterTypefaceToAsset(fontData!, FontCollection.DefaultFamilyName, false);
        
        BlazorApplication.Run(() => new IndexPage(), glHandle, width, height, ratio, routePath);
    }
}