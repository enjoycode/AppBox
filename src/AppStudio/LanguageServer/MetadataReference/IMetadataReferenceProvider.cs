using Microsoft.CodeAnalysis;

namespace AppBoxDesign;

public interface IMetadataReferenceProvider
{
    ValueTask<MetadataReference> LoadSdkLib(string assemblyName);

    ValueTask<MetadataReference> LoadCommonLib(string assemblyName);

    ValueTask<MetadataReference> LoadClientLib(string assemblyName);

    ValueTask<MetadataReference> LoadServerLib(string assemblyName);
}