using AppBoxCore;

namespace AppBoxDesign;

public interface IPublishService
{
    Task PublishAsync(PublishPackage package, string commitMessage);

    Task BeginUploadApp();
    
    Task UploadAppAssembly(Stream stream, string assemblyName);
    
    Task UploadViewAssemblyMap(Stream stream);
}