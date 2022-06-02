using System.Reflection;
using AppBoxCore;
using AppBoxStore;
using AppBoxWebHost;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

var app = builder.Build();

// Configure the HTTP request pipeline.

// app.UseHttpsRedirection();

// app.UseAuthorization();

app.UseWebSockets();

app.MapControllers();

// 初始化
RuntimeContext.Init(new HostRuntimeContext());
#if !FUTURE
// 加载默认SqlStore
var libPath = Path.GetDirectoryName(typeof(SqlStore).Assembly.Location)!;
var asm = Assembly.LoadFile(Path.Combine(libPath,
    $"{app.Configuration["DefaultSqlStore:Assembly"]}.dll"));
var type = asm.GetType(app.Configuration["DefaultSqlStore:Type"])!;
var defaultSqlStore = (SqlStore)
    Activator.CreateInstance(type, app.Configuration["DefaultSqlStore:ConnectionString"])!;
SqlStore.InitDefaultSqlStore(defaultSqlStore);
// 尝试初始化存储, 初始化失败直接终止进程
MetaStore.Init(new SqlMetaStore());
MetaStore.Provider.TryInitStoreAsync();
#endif

app.Run();