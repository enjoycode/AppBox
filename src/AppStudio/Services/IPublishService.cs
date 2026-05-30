using AppBoxCore;
using AppBoxCore.Channel;

namespace AppBoxDesign;

public interface IPublishService
{
    Task PublishAsync(PublishPackage package, string commitMessage);

    Task UploadServiceAssembly(BytesPipeWriter writer, string assemblyName, bool isFirst);

    Task UploadAppAssembly(Stream stream, string assemblyName, bool isFirst);

    Task UploadViewAssemblyMap(BytesPipeWriter writer);
}