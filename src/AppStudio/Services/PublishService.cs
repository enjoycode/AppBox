using AppBoxClient;
using AppBoxCore;

namespace AppBoxDesign;

internal sealed class PublishService : IPublishService
{
    public Task PublishAsync(PublishPackage package, string commitMessage)
    {
        return Channel.Invoke("sys.DesignService.Publish", [package, commitMessage]);
    }

    public Task BeginUploadApp()
    {
        return Channel.Invoke("sys.DesignService.BeginUploadApp");
    }

    public Task UploadAppAssembly(Action<IOutputStream> writer)
    {
        return Channel.Invoke("sys.DesignService.UploadAppAssembly", writer);
    }

    public Task UploadViewAssemblyMap(Action<IOutputStream> writer)
    {
        return Channel.Invoke("sys.DesignService.UploadViewAssemblyMap", writer);
    }
}