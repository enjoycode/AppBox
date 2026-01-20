using System.IO.Compression;
using AppBoxCore;
using AppBoxStore;

namespace AppBoxServer;

/// <summary>
/// 依赖的外部库(第三方库)管理器
/// </summary>
internal static class ExternalLibraryManager
{
    /// <summary>
    /// 上传第三方库, 注意：目前仅支持服务依赖的库
    /// </summary>
    internal static async Task<byte> UploadLibrary(IInputStream stream)
    {
        var appName = stream.ReadString()!;
        var fileName = stream.ReadString()!;
        var filePath = Path.Combine(AppContext.BaseDirectory, "External", appName, fileName);

        // save to External library folder
        await using var wfs = File.OpenWrite(filePath);
        await stream.ToSystemStream().CopyToAsync(wfs);
        await wfs.FlushAsync();

        // check is native assembly
        var assemblyFlag = AssemblyFlag.None;
        var extName = Path.GetExtension(fileName);
        assemblyFlag = extName switch
        {
            "so" => AssemblyFlag.LinuxNative,
            "dylib" => AssemblyFlag.MacOSNative,
            "dll" => IsDotNetAssembly(filePath) ? AssemblyFlag.None : AssemblyFlag.WindowsNative,
            _ => assemblyFlag
        };

        // compress to bytes
        using var ms = new MemoryStream();
        await using var zs = new BrotliStream(ms, CompressionMode.Compress, true);
        await using var rfs = File.OpenRead(filePath);
        await rfs.CopyToAsync(zs);
        await zs.FlushAsync();
        var compressed = ms.ToArray();

        // save to meta store
        var metaName = $"{appName}.{fileName}";
        await MetaStore.Provider.UpsertAssemblyAsync(MetaAssemblyType.ExtService, metaName, compressed,
            null, assemblyFlag);

        //TODO:*****
        // 1. 通知所有DesignHub.TypeSystem更新MetadataReference缓存，并更新相关项目引用
        //TypeSystem.RemoveMetadataReference(fileName, appID);
        // 2. 如果相应的AppContainer已启动，通知其移除所有引用该第三方组件的服务实例缓存，使其自动重新加载
        // 3. 如果集群模式，通知集群其他节点做上述1，2操作

        return (byte)assemblyFlag;
    }

    // https://stackoverflow.com/questions/1366503/best-way-to-check-if-a-dll-file-is-a-clr-assembly-in-c-sharp
    // http://msdn.microsoft.com/en-us/library/ms173100.aspx
    private static bool IsDotNetAssembly(string file)
    {
        try
        {
            System.Reflection.AssemblyName.GetAssemblyName(file);
            return true;
        }
        catch (BadImageFormatException)
        {
            return false;
        }
    }
}