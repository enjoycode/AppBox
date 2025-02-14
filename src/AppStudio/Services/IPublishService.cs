using AppBoxCore;

namespace AppBoxDesign;

public interface IPublishService
{
    Task PublishAsync(PublishPackage package, string commitMessage);

    Task BeginUploadApp();
    
    Task UploadAppAssembly(Action<IOutputStream> writer);
    
    Task UploadViewAssemblyMap(Action<IOutputStream> writer);
}