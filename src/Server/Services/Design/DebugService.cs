using AppBoxCore;
using static AppBoxServer.ServerLogger;

namespace AppBoxServer.Design;

internal static class DebugService
{
    private static string GetDebugFolderPath()
    {
        var session = RuntimeContext.CurrentSession!;
        return Path.Combine(Path.GetTempPath(), "AppBox", "ServiceDebug", session.Name);
    }

    /// <summary>
    /// 上传编译好的服务组件
    /// </summary>
    internal static async Task UploadAssembly(IInputStream stream)
    {
        var asmName = stream.ReadString()!; //eg: erp.OrderService
        var debugPath = GetDebugFolderPath();
        if (!Directory.Exists(debugPath))
            Directory.CreateDirectory(debugPath);

        var asmFilePath = Path.Combine(debugPath, $"{asmName}.dll");
        await using var fs = new FileStream(asmFilePath, FileMode.Create, FileAccess.Write, FileShare.None);
        await stream.ToSystemStream().CopyToAsync(fs);
        await fs.FlushAsync();
        Logger.Debug($"Upload debug service to: {asmFilePath} {fs.Length}");
    }

    /// <summary>
    /// 开始服务调试
    /// </summary>
    internal static async Task StartDebugService(IInputStream stream)
    {
        var debugPath = GetDebugFolderPath();
        if (!Directory.Exists(debugPath))
            throw new Exception("Debug service directory not found");

        var session = RuntimeContext.CurrentSession!;
        var service = stream.ReadString()!; //eg: erp.OrderService
        var methodName = stream.ReadString()!; //eg: SaveOrder
        //TODO: 读取Breakpoints并将调用参数写入args.bin文件

        //启动netcoredbg进程
        var debugProcess = new DebugProcess(session);
        debugProcess.Start(session.Name, $"{service}.{methodName}");
    }
}