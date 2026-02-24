using AppBoxStore;
using Microsoft.CodeAnalysis;

namespace AppBoxDesign;

/// <summary>
/// 从服务端远程加载MetadataReference
/// </summary>
internal sealed class ServerMetadataReferenceProvider : IMetadataReferenceProvider
{
    public ValueTask<MetadataReference> LoadSdkLib(string assemblyName) =>
        this.LoadMetadataReferenceFromServer(MetadataReferenceType.SdkLibrary, assemblyName);

    public ValueTask<MetadataReference> LoadCommonLib(string assemblyName) =>
        this.LoadMetadataReferenceFromServer(MetadataReferenceType.CoreLibrary, assemblyName);

    public ValueTask<MetadataReference> LoadClientLib(string assemblyName) =>
        this.LoadMetadataReferenceFromServer(MetadataReferenceType.ClientLibrary, assemblyName);

    public ValueTask<MetadataReference> LoadServerLib(string assemblyName) =>
        this.LoadMetadataReferenceFromServer(MetadataReferenceType.ServerLibrary, assemblyName);

    public ValueTask<MetadataReference> LoadServerExtLib(string appName, string assemblyName) =>
        this.LoadMetadataReferenceFromServer(MetadataReferenceType.ServerExtLibrary, assemblyName, appName);
}