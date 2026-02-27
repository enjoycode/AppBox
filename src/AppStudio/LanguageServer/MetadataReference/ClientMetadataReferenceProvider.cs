using AppBoxCore;
using Microsoft.CodeAnalysis;

namespace AppBoxDesign;

/// <summary>
/// 本地加载MetadataReference(服务端的需要远程加载)
/// </summary>
internal sealed class ClientMetadataReferenceProvider : IMetadataReferenceProvider
{
    private readonly string _sdkPath = Path.GetDirectoryName(typeof(object).Assembly.Location)!;
    private readonly string _appPath = Path.GetDirectoryName(typeof(TypeSystem).Assembly.Location)!;

    public ValueTask<MetadataReference> LoadSdkLib(string assemblyName)
    {
        var fullPath = Path.Combine(_sdkPath, assemblyName);
        return new ValueTask<MetadataReference>(MetadataReference.CreateFromFile(fullPath));
    }

    public ValueTask<MetadataReference> LoadCommonLib(string assemblyName)
    {
        var fullPath = Path.Combine(_appPath, assemblyName);
        return new ValueTask<MetadataReference>(MetadataReference.CreateFromFile(fullPath));
    }

    public ValueTask<MetadataReference> LoadClientLib(string assemblyName)
    {
        var fullPath = Path.Combine(_appPath, assemblyName);
        return new ValueTask<MetadataReference>(MetadataReference.CreateFromFile(fullPath));
    }

    public ValueTask<MetadataReference> LoadServerLib(string assemblyName) =>
        this.LoadMetadataReferenceFromServer(ModelDependencyType.ServerLibrary, assemblyName);

    public ValueTask<MetadataReference> LoadServerExtLib(string appName, string assemblyName) =>
        this.LoadMetadataReferenceFromServer(ModelDependencyType.ServerExtLibrary, assemblyName, appName);
}