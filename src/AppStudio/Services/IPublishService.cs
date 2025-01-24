namespace AppBoxDesign;

public interface IPublishService
{
    Task PublishAsync(PublishPackage package, string commitMessage);
}