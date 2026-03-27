using AppBoxCore;
using Channel = AppBoxClient.Channel;

namespace AppBoxDesign;

internal sealed class MetaStoreService : IMetaStoreService
{
    public Task<ApplicationModel[]> LoadAllApplicationAsync() =>
        Channel.Invoke<ApplicationModel[]>("sys.DesignService.LoadAllApplication");

    public Task<ModelFolder[]> LoadAllFolderAsync() =>
        Channel.Invoke<ModelFolder[]>("sys.DesignService.LoadAllFolder");

    public Task<ModelBase[]> LoadAllModelAsync() =>
        Channel.Invoke<ModelBase[]>("sys.DesignService.LoadAllModel");

    public Task<string?> LoadModelCodeAsync(ModelId modelId) =>
        Channel.Invoke<string?>("sys.DesignService.LoadModelCode", (long)modelId);

    public async Task<ModelId> GenModelIdAsync(int appId, ModelType modelType, ModelLayer layer) =>
        await Channel.Invoke<long>("sys.DesignService.GenModelId", appId, (int)modelType, (int)layer);
}