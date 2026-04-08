using AppBoxClient;
using AppBoxCore;

namespace AppBoxDesign;

internal sealed class PublishService : IPublishService
{
    public Task PublishAsync(PublishPackage package, string commitMessage) =>
        Channel.Invoke("sys.DesignService.Publish", AnyValue.From(package), commitMessage);

    public Task UploadServiceAssembly(Stream stream, string assemblyName, bool isFirst) =>
        Channel.Upload("sys.DesignService.UploadServiceAssembly", stream, assemblyName, isFirst);

    public Task UploadAppAssembly(Stream stream, string assemblyName, bool isFirst) =>
        Channel.Upload("sys.DesignService.UploadAppAssembly", stream, assemblyName, isFirst);

    public Task UploadViewAssemblyMap(Stream stream) =>
        Channel.Upload("sys.DesignService.UploadViewAssemblyMap", stream);
}