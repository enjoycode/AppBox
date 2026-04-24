using AppBoxCore;
using Channel = AppBoxClient.Channel;

namespace AppBoxDesign;

internal sealed class MetaStoreService : IMetaStoreService
{
    public async Task<IList<ApplicationModel>> LoadAllApplicationAsync()
    {
        using var ms = new MemoryStream(1024);
        await Channel.Download("sys.DesignService.LoadAllApplication", ms);

        ms.Position = 0;
        return MetaSerializer.DeserializeApplications(ms);
    }

    public async Task<IList<ModelFolder>> LoadAllFolderAsync()
    {
        using var ms = new MemoryStream(1024);
        await Channel.Download("sys.DesignService.LoadAllFolder", ms);

        ms.Position = 0;
        return MetaSerializer.DeserializeFolders(ms);
    }

    public async Task<IList<ModelBase>> LoadAllModelAsync()
    {
        //TODO: write to temp local file
        using var ms = new MemoryStream(8192);
        await Channel.Download("sys.DesignService.LoadAllModel", ms);

        ms.Position = 0;
        return MetaSerializer.DeserializeModels(ms);
    }

    public Task DownloadModelCodeAsync(Stream toStream, ModelId modelId) =>
        Channel.Download("sys.DesignService.LoadModelCode", toStream, (long)modelId);

    public async Task<ModelId> GenModelIdAsync(int appId, ModelType modelType, ModelLayer layer) =>
        await Channel.Invoke<long>("sys.DesignService.GenModelId", appId, (int)modelType, (int)layer);

    public Task<byte[]?> LoadModelIdCounterAsync(int appId, bool forDev) =>
        Channel.Invoke<byte[]?>(DesignMethods.LoadModelIdCounter, appId, forDev);

    public Task UpsertModelIdCounterAsync(int appId, bool forDev, byte[] counterData) =>
        Channel.Invoke(DesignMethods.UpsertModelIdCounter, appId, forDev, AnyValue.From(counterData));

    public Task CreateApplicationAsync(ApplicationModel app) =>
        Channel.Invoke(DesignMethods.CreateApplicationFull, AnyValue.From(app));

    public Task DeleteApplicationAsync(ApplicationModel app) =>
        Channel.Invoke(DesignMethods.DeleteApplicationFull, AnyValue.From(app));

    public Task<byte> UploadExtLib(Stream input, string appName, string fileName) =>
        Channel.Upload<byte>(DesignMethods.UploadExtAssemblyFull, input, appName, fileName);
}