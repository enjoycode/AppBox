using AppBoxClient;
using Microsoft.CodeAnalysis;

namespace AppBoxDesign;

internal sealed class ServerMetadataReferenceProvider : IMetadataReferenceProvider
{
    public ValueTask<MetadataReference> LoadSdkLib(string assemblyName) => LoadInternal(0, assemblyName);

    public ValueTask<MetadataReference> LoadCommonLib(string assemblyName) => LoadInternal(1, assemblyName);
    
    public ValueTask<MetadataReference> LoadClientLib(string assemblyName) => LoadInternal(2, assemblyName);
    
    public ValueTask<MetadataReference> LoadServerLib(string assemblyName) => LoadInternal(3, assemblyName);

    private async ValueTask<MetadataReference> LoadInternal(int type, string assemblyName)
    {
        await using var stream = await Channel.InvokeForStream("sys.DesignService.LoadMetadataReference", [type, assemblyName]);
        return MetadataReference.CreateFromStream(stream);
    }
}