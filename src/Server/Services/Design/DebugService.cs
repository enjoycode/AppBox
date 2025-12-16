using AppBoxCore;
using static AppBoxServer.ServerLogger;

namespace AppBoxServer.Design;

internal static class DebugService
{
    /// <summary>
    /// 上传编译好的服务组件
    /// </summary>
    /// <param name="stream"></param>
    internal static async Task UploadAssembly(IInputStream stream)
    {
        var asmName = stream.ReadString()!; //eg: erp.OrderService
        var session = RuntimeContext.CurrentSession!;
        var debugPath = Path.Combine(Path.GetTempPath(), "AppBox", "ServiceDebug", session.Name);
        if (!Directory.Exists(debugPath))
            Directory.CreateDirectory(debugPath);

        var asmFilePath = Path.Combine(debugPath, $"{asmName}.dll");
        await using var fs = new FileStream(asmFilePath, FileMode.Create, FileAccess.Write, FileShare.None);
        await stream.ToSystemStream().CopyToAsync(fs);
        await fs.FlushAsync();
        Logger.Debug($"Upload to: {asmFilePath} {fs.Length}");
    }
}