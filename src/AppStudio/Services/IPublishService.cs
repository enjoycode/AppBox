using AppBoxCore;

namespace AppBoxDesign;

public interface IPublishService
{
    Task PublishAsync(PublishPackage package, string commitMessage);

    Task UploadServiceAssembly(Stream stream, string assemblyName, bool isFirst);

    Task UploadAppAssembly(Stream stream, string assemblyName, bool isFirst);

    Task UploadViewAssemblyMap(Stream stream);
}