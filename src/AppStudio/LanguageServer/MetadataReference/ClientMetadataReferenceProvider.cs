using AppBoxStore;
using Microsoft.CodeAnalysis;

namespace AppBoxDesign;

internal sealed class ClientMetadataReferenceProvider : IMetadataReferenceProvider
{
    private readonly string _sdkPath = Path.GetDirectoryName(typeof(object).Assembly.Location)!;
    private readonly string _appPath = Path.GetDirectoryName(typeof(MetaStore).Assembly.Location)!;

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

    public ValueTask<MetadataReference> LoadServerLib(string assemblyName)
    {
        var fullPath = Path.Combine(_appPath, assemblyName);
        return new ValueTask<MetadataReference>(MetadataReference.CreateFromFile(fullPath));
    }
}