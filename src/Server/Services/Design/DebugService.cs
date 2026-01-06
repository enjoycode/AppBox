using System.Collections.Concurrent;
using AppBoxCore;
using AppBoxDesign.Debugging;
using static AppBoxServer.ServerLogger;

namespace AppBoxServer.Design;

internal static class DebugService
{
    private static readonly ConcurrentDictionary<string, DebugProcess> Processes = new();

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
    internal static void Start(IInputStream stream)
    {
        var debugPath = GetDebugFolderPath();
        if (!Directory.Exists(debugPath))
            throw new Exception("Debug service directory not found");

        var session = RuntimeContext.CurrentSession!;
        var modelId = stream.ReadLong();
        var appName = stream.ReadString()!;
        var serviceName = stream.ReadString()!;
        var methodName = stream.ReadString()!; //eg: SaveOrder
        //读取Breakpoints
        var breakpointCount = stream.ReadVariant();
        var breakpoints = new int[breakpointCount];
        for (var i = 0; i < breakpointCount; i++)
        {
            breakpoints[i] = stream.ReadInt();
        }

        //TODO: 将调用参数写入args.bin备用

        //启动netcoredbg进程
        var debugProcess = new DebugProcess(session, modelId);
        if (!Processes.TryAdd(session.Name, debugProcess))
            throw new Exception("Debugging already started");

        debugProcess.Start(session.Name, appName, serviceName, methodName, breakpoints);
    }

    private static DebugProcess? FindDebugProcess(bool throwExceptionWhenNull = true)
    {
        var session = RuntimeContext.CurrentSession;
        if (session == null)
        {
            return throwExceptionWhenNull ? throw new Exception("Debugging not started") : null;
        }

        if (!Processes.TryGetValue(session.Name, out var process))
        {
            return throwExceptionWhenNull ? throw new Exception($"Debugging not started for [{session.Name}]") : null;
        }

        return process;
    }

    internal static void Resume() => FindDebugProcess()!.Resume();

    internal static void Exit() => FindDebugProcess(false)?.Exit();

    internal static Task<DebugEventArgs> Evaluate(string expression) =>
        FindDebugProcess()!.CreateVariable(expression);

    internal static Task<DebugEventArgs> ListChildren(string variableName) =>
        FindDebugProcess()!.ListVariableChildren(variableName);

    internal static void OnProcessExited(string sessionName)
    {
        Processes.TryRemove(sessionName, out _);
    }
}