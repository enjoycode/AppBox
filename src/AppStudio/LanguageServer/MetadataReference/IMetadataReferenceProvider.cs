using AppBoxClient;
using AppBoxCore;
using Microsoft.CodeAnalysis;

namespace AppBoxDesign;

public interface IMetadataReferenceProvider
{
    ValueTask<MetadataReference> LoadSdkLib(string assemblyName);

    ValueTask<MetadataReference> LoadCommonLib(string assemblyName);

    ValueTask<MetadataReference> LoadClientLib(string assemblyName);

    ValueTask<MetadataReference> LoadServerLib(string assemblyName);

    /// <summary>
    /// 加载服务端的外部依赖库
    /// </summary>
    ValueTask<MetadataReference> LoadServerExtLib(string appName, string assemblyName);
}

internal static class MetadataReferenceProviderExtensions
{
    /// <summary>
    /// 从服务端加载MetadataReference
    /// </summary>
    /// <param name="provider"></param>
    /// <param name="type"></param>
    /// <param name="assemblyName"></param>
    /// <param name="appName">仅加载外部依赖需要</param>
    /// <returns></returns>
    internal static async ValueTask<MetadataReference> LoadMetadataReferenceFromServer(
        this IMetadataReferenceProvider provider,
        ModelDependencyType type, string assemblyName, string? appName = null)
    {
        var tempFileStream = LocalFileSystem.CreateTempFile(out var tempFilePath, false);
        try
        {
            await Channel.Download(DesignMethods.LoadMetadataReferenceFull, tempFileStream,
                (int)type, assemblyName, string.IsNullOrEmpty(appName) ? "" : appName);

            tempFileStream.Position = 0;
            return MetadataReference.CreateFromStream(tempFileStream);
        }
        finally
        {
            await tempFileStream.DisposeAsync();
            LocalFileSystem.DeleteTempFile(tempFilePath);
        }
    }
}