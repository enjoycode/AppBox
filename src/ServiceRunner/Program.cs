using System.Runtime.InteropServices;
using AppBoxCore;
using AppBoxStore;
using AppBoxServer;
using NanoLog;
using ServiceDebugger;

//验证参数：
// 0 = 调试会话标识
// 1 = 待调试的目标服务方法 eg: erp.OrderService.Save
// 2 = 模拟的用户名称,可以为空 eg: Admin
if (args.Length != 3 && args.Length != 2)
{
    Console.WriteLine("Invalid arguments!");
    return;
}

var sessionId = args[0];
var serviceMethod = args[1];
var mockUserName = args.Length == 3 ? args[2] : string.Empty;
var debugFolder = Path.Combine(Path.GetTempPath(), "AppBox", "ServiceDebug", sessionId);
if (!Directory.Exists(debugFolder))
{
    Console.WriteLine($"DebugFolder not found: {debugFolder}");
    return;
}

var sr = serviceMethod.Split('.');
var appName = sr[0];
var serviceName = sr[1];
var methodName = sr[2];

NanoLogger.Start( /*new NanoLoggerOptions().AddLogger(new UnitTestConsoleLogger())*/);

//临时方案Console输出编码问题
if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
    Console.OutputEncoding = System.Text.Encoding.UTF8;

// 初始化运行环境
RuntimeContext.Init(new HostRuntimeContext(), new PasswordHasher());

//开始读取配置文件
var settingFile = Path.Combine(AppContext.BaseDirectory, "appsettings.json");
await using var file = File.OpenRead(settingFile);
using var jsonDoc = await System.Text.Json.JsonDocument.ParseAsync(file);
var storeConfig = jsonDoc.RootElement.GetProperty("DefaultSqlStore");
// 加载默认SqlStore
try
{
    SqlStore.InitDefault(
        storeConfig.GetProperty("Assembly").GetString()!,
        storeConfig.GetProperty("Type").GetString()!,
        storeConfig.GetProperty("ConnectionString").GetString()!
    );
}
catch (Exception e)
{
    Console.WriteLine($"Init default store error: {e.Message}");
    return;
}

MetaStore.Init(new SqlMetaStore());

//注入待调试的服务实例
try
{
    AppServiceContainer.InjectDebugService(debugFolder, appName, serviceName);
}
catch (Exception e)
{
    Console.WriteLine($"Inject debug service error: {e.Message}");
    return;
}

//TODO:模拟当前用户

//TODO:反序列化调用请求的参数，并开始执行方法
InvokeResult invokeResult;
try
{
    var result = await RuntimeContext.Current.InvokeAsync(serviceMethod, AnyArgs.Empty /*TODO:*/);
    invokeResult = new InvokeResult() { Result = result.BoxedValue };
}
catch (Exception e)
{
    invokeResult = new InvokeResult() { ErrorMessage = e.Message };
}

Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(invokeResult));


NanoLogger.Stop();