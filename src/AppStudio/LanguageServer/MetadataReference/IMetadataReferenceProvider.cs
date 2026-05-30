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
        var tempFile = await LocalFileSystem.CreateTempFile(false);
        try
        {
            var reader = Channel.Download(DesignMethods.LoadMetadataReferenceFull,
                (int)type, assemblyName, string.IsNullOrEmpty(appName) ? "" : appName);
            await reader.CopyToStreamAsync(tempFile.FileStream);
            tempFile.FileStream.Position = 0;
            return MetadataReference.CreateFromStream(tempFile.FileStream);
        }
        finally
        {
            await tempFile.Close();
            await LocalFileSystem.DeleteTempFile(tempFile.FilePath);
        }
    }
}