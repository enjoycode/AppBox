using System.Runtime.InteropServices;
using AppBoxCore;
using AppBoxStore;
using AppBoxServer;
using AppBoxWebHost;

//临时方案Console输出编码问题
if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
    Console.OutputEncoding = System.Text.Encoding.UTF8;

var builder = WebApplication.CreateBuilder(args);
// Add services to the container.
builder.Services.AddControllers();

var app = builder.Build();

//TODO:以下RestApi根据全局配置是否启用当前功能
app.MapPost("/rest/login", RestController.Login);
app.MapPost("/rest/invoke", RestController.Invoke);

var defaultFilesOptions = new DefaultFilesOptions();
defaultFilesOptions.DefaultFileNames.Clear();
defaultFilesOptions.DefaultFileNames.Add("index.html");
app.UseDefaultFiles(defaultFilesOptions);
app.UsePrecompressedPrecompressedBlazor();
app.UseStaticFiles(new StaticFileOptions
{
    ContentTypeProvider = new PrecompressedContentTypeProvider()
});

app.UseWebSockets();
app.MapDefaultControllerRoute();
app.MapControllers();

// 初始化
RuntimeContext.Init(new HostRuntimeContext(), new PasswordHasher());
#if !FUTURE
// 加载默认SqlStore
try
{
    SqlStore.InitDefault(app.Configuration["DefaultSqlStore:Assembly"]!,
        app.Configuration["DefaultSqlStore:Type"]!,
        app.Configuration["DefaultSqlStore:ConnectionString"]!);
}
catch (Exception e)
{
    Console.WriteLine($"Init default store error: {e.Message}");
    return;
}

// 尝试初始化存储, 初始化失败直接终止进程
MetaStore.Init(new SqlMetaStore());
await SqlStoreInitiator.TryInitStoreAsync();
#endif

app.Run();