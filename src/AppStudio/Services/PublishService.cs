using AppBoxClient;
using AppBoxCore;
using AppBoxCore.Channel;

namespace AppBoxDesign;

internal sealed class PublishService : IPublishService
{
    public Task PublishAsync(PublishPackage package, string commitMessage) =>
        Channel.Invoke("sys.DesignService.Publish", AnyValue.From(package), commitMessage);

    public Task UploadServiceAssembly(BytesPipeWriter writer, string assemblyName, bool isFirst) =>
        Channel.Upload("sys.DesignService.UploadServiceAssembly", writer, assemblyName, isFirst);

    public Task UploadAppAssembly(Stream stream, string assemblyName, bool isFirst)
    {
        var pipeWriter = new BytesPipeWriter(w => w.CopyFromAsync(stream));
        return Channel.Upload("sys.DesignService.UploadAppAssembly", pipeWriter, assemblyName, isFirst);
    }

    public Task UploadViewAssemblyMap(BytesPipeWriter writer) =>
        Channel.Upload("sys.DesignService.UploadViewAssemblyMap", writer);
}