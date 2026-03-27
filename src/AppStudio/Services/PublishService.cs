using AppBoxClient;
using AppBoxCore;

namespace AppBoxDesign;

internal sealed class PublishService : IPublishService
{
    public Task PublishAsync(PublishPackage package, string commitMessage) =>
        Channel.Invoke("sys.DesignService.Publish", AnyValue.From(package), commitMessage);

    public Task BeginUploadApp() => Channel.Invoke("sys.DesignService.BeginUploadApp");

    public Task UploadAppAssembly(Stream stream, string assemblyName) =>
        Channel.Upload("sys.DesignService.UploadAppAssembly", stream, assemblyName);

    public Task UploadViewAssemblyMap(Action<IOutputStream> writer)
    {
        return Channel.Invoke("sys.DesignService.UploadViewAssemblyMap", writer);
    }
}