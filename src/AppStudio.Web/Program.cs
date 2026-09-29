using System.Runtime.Versioning;
using AppBoxClient;
using AppBoxDesign;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Microsoft.JSInterop;
using PixUI;
using PixUI.Platform.Blazor;

[SupportedOSPlatform("browser")]
public static class Program
{
    public static async Task Main(string[] args)
    {
        var builder = WebAssemblyHostBuilder.CreateDefault(args);
        builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });

        var host = builder.Build();
        WebApplication.JSRuntime = host.Services.GetRequiredService<IJSRuntime>();
        WebApplication.HttpClient = host.Services.GetService<HttpClient>()!;

        //调用js获取启动参数
        var jsRuntime = ((IJSInProcessRuntime)WebApplication.JSRuntime);
        var runInfo = await jsRuntime.InvokeAsync<RunInfo>("PixUI.BeforeRunApp");
        await Run(runInfo);
        jsRuntime.InvokeVoid("PixUI.BindEvents");

        await host.RunAsync();
    }

    private static async Task Run(RunInfo runInfo)
    {
        //初始化通讯
        Channel.Init(new WebSocketChannel(new Uri(runInfo.WsUrl)));

        //初始化默认字体
        await using var fontDataStream =
            await WebApplication.HttpClient.GetStreamAsync("/dev/fonts/MiSans-Regular.woff2");
        //因fontDataStream不支持同步复制(DotNet10)，所以先复制至MemoryStream
        using var ms = new MemoryStream();
        await fontDataStream.CopyToAsync(ms);
        ms.Position = 0;
        FontCollection.RegisterTypeface(ms, FontCollection.DefaultFamilyName, false);

        //加载HomePage
        WebApplication.Run(() => new HomePage(), runInfo);
    }
}