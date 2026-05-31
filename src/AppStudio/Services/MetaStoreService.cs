using AppBoxCore;
using AppBoxCore.Channel;
using Channel = AppBoxClient.Channel;

namespace AppBoxDesign;

internal sealed class MetaStoreService : IMetaStoreService
{
    public async Task<IList<ApplicationModel>> LoadAllApplicationAsync()
    {
        var reader = Channel.Download("sys.DesignService.LoadAllApplication");
        using var ms = new MemoryStream(1024);
        await reader.CopyToStreamAsync(ms);
        ms.Position = 0;
        return MetaSerializer.DeserializeApplications(ms);
    }

    public async Task<IList<ModelFolder>> LoadAllFolderAsync()
    {
        var reader = Channel.Download("sys.DesignService.LoadAllFolder");
        using var ms = new MemoryStream(1024);
        await reader.CopyToStreamAsync(ms);
        ms.Position = 0;
        return MetaSerializer.DeserializeFolders(ms);
    }

    public async Task<IList<ModelBase>> LoadAllModelAsync()
    {
        //TODO: use pipe divided objects
        var reader = Channel.Download("sys.DesignService.LoadAllModel");
        using var ms = new MemoryStream(8192);
        await reader.CopyToStreamAsync(ms);
        ms.Position = 0;
        return MetaSerializer.DeserializeModels(ms);
    }

    public async Task DownloadModelCodeAsync(Stream toStream, ModelId modelId)
    {
        var reader = Channel.Download("sys.DesignService.LoadModelCode", (long)modelId);
        await reader.CopyToStreamAsync(toStream);
    }

    public async Task<ModelId> GenModelIdAsync(int appId, ModelType modelType, ModelLayer layer) =>
        await Channel.Invoke<long>("sys.DesignService.GenModelId", appId, (int)modelType, (int)layer);

    public Task<byte[]?> LoadModelIdCounterAsync(int appId, bool forDev) =>
        Channel.Invoke<byte[]>(DesignMethods.LoadModelIdCounterFull, appId, forDev);

    public Task UpsertModelIdCounterAsync(int appId, bool forDev, byte[] counterData) =>
        Channel.Invoke(DesignMethods.UpsertModelIdCounterFull, appId, forDev, AnyValue.From(counterData));

    public Task CreateApplicationAsync(ApplicationModel app) =>
        Channel.Invoke(DesignMethods.CreateApplicationFull, AnyValue.From(app));

    public Task DeleteApplicationAsync(ApplicationModel app) =>
        Channel.Invoke(DesignMethods.DeleteApplicationFull, AnyValue.From(app));

    public Task<byte> UploadExtLib(Stream input, string appName, string fileName)
    {
        var pipeWriter = new PipeBytesWriter(w => w.CopyFromAsync(input));
        return Channel.Upload<byte>(DesignMethods.UploadExtAssemblyFull, pipeWriter, appName, fileName);
    }
}