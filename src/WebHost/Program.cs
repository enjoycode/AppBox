using AppBoxCore;
using AppBoxStore;
using AppBoxServer;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);
// Add services to the container.
builder.Services.AddControllers();

var app = builder.Build();
app.UseWebSockets();
app.MapControllers();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider =
        new PhysicalFileProvider(
            Path.Combine(Path.GetDirectoryName(typeof(RuntimeContext).Assembly.Location)!,
                "WebRoot"))
});

// 初始化
RuntimeContext.Init(new HostRuntimeContext(), new PasswordHasher());
#if !FUTURE
// 加载默认SqlStore
SqlStore.InitDefault(app.Configuration["DefaultSqlStore:Assembly"],
    app.Configuration["DefaultSqlStore:Type"],
    app.Configuration["DefaultSqlStore:ConnectionString"]);
// 尝试初始化存储, 初始化失败直接终止进程
MetaStore.Init(new SqlMetaStore());
MetaStore.Provider.TryInitStoreAsync();
#endif

app.Run();