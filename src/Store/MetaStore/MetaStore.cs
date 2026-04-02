using AppBoxCore;

namespace AppBoxStore;

public static class MetaStore
{
    private static IMetaStore? _provider;

    public static IMetaStore Provider => _provider!;

    public static void Init(IMetaStore provider)
    {
        if (_provider != null) throw new Exception();
        _provider = provider;
    }

    /// <summary>
    /// 设计时下载所有应用模型
    /// </summary>
    internal static async Task<Stream> DownloadApplicationsAsync()
    {
        var ms = new MemoryStream(1024);
        await Provider.LoadMetasAsync(ms, MetaType.META_APPLICATION, null);
        ms.Position = 0;
        return ms;
    }

    /// <summary>
    /// 设计时下载所有文件夹
    /// </summary>
    internal static async Task<Stream> DownloadFoldersAsync()
    {
        var ms = new MemoryStream(1024);
        await Provider.LoadMetasAsync(ms, MetaType.META_FOLDER, null);
        ms.Position = 0;
        return ms;
    }

    /// <summary>
    /// 设计时下载所有模型
    /// </summary>
    internal static async Task<Stream> DownloadModelsAsync()
    {
        var tempFilePath = Path.GetTempFileName();
        var tempFileStream = File.Open(tempFilePath, FileMode.Create, FileAccess.ReadWrite);
        await Provider.LoadMetasAsync(tempFileStream, MetaType.META_MODEL, null);
        tempFileStream.Position = 0;
        return tempFileStream;
    }

    internal static async Task<IList<ApplicationModel>> LoadAllApplicationAsync()
    {
        await using var stream = await DownloadApplicationsAsync();
        stream.Position = 0;
        return MetaSerializer.DeserializeApplications(stream);
    }

    internal static async Task<IList<ModelFolder>> LoadAllPermissionFolderAsync()
    {
        var ms = new MemoryStream(1024);
        await Provider.LoadMetasAsync(ms, MetaType.META_FOLDER, (byte)ModelType.Permission);
        ms.Position = 0;
        return MetaSerializer.DeserializeFolders(ms);
    }

    internal static async Task<IList<PermissionModel>> LoadAllPermissionAsync()
    {
        var ms = new MemoryStream(1024);
        await Provider.LoadMetasAsync(ms, MetaType.META_MODEL, (byte)ModelType.Permission);
        ms.Position = 0;
        return MetaSerializer.DeserializeModels(ms).Cast<PermissionModel>().ToList();
    }
}