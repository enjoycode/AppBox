using AppBoxClient;

namespace AppBoxDesign;

internal sealed class PublishService : IPublishService
{
    public Task PublishAsync(PublishPackage package, string commitMessage)
    {
        return Channel.Invoke("sys.DesignService.Publish", [package, commitMessage]);
    }
}