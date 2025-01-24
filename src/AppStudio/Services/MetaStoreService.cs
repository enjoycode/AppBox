using AppBoxCore;
using Channel = AppBoxClient.Channel;

namespace AppBoxDesign;

internal sealed class MetaStoreService : IMetaStoreService
{
    public async Task<ApplicationModel[]> LoadAllApplicationAsync()
    {
        var list = await Channel.Invoke<ApplicationModel[]>("sys.DesignService.LoadAllApplication");
        return list ?? throw new Exception("Failed to load application");
    }

    public async Task<ModelFolder[]> LoadAllFolderAsync()
    {
        var list = await Channel.Invoke<ModelFolder[]>("sys.DesignService.LoadAllFolder");
        return list ?? [];
    }

    public async Task<ModelBase[]> LoadAllModelAsync()
    {
        var list = await Channel.Invoke<ModelBase[]>("sys.DesignService.LoadAllModel");
        return list ?? [];
    }

    public Task<string?> LoadModelCodeAsync(ModelId modelId)
    {
        return Channel.Invoke<string>("sys.DesignService.LoadModelCode", [(long)modelId]);
    }

    public async Task<ModelId> GenModelIdAsync(int appId, ModelType modelType, ModelLayer layer)
    {
        return await Channel.Invoke<long>("sys.DesignService.GenModelId", [appId, (int)modelType, (int)layer]);
    }
}