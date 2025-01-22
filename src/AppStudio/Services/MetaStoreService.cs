using System.Threading.Channels;
using AppBoxCore;
using Channel = AppBoxClient.Channel;

namespace AppBoxDesign;

internal static class MetaStoreService
{
    public static async Task<ApplicationModel[]> LoadAllApplicationAsync()
    {
        var list = await Channel.Invoke<ApplicationModel[]>("sys.DesignService.LoadAllApplication");
        return list ?? throw new Exception("Failed to load application");
    }

    public static async Task<ModelFolder[]> LoadAllFolderAsync()
    {
        var list = await Channel.Invoke<ModelFolder[]>("sys.DesignService.LoadAllFolder");
        return list ?? [];
    }

    public static async Task<ModelBase[]> LoadAllModelAsync()
    {
        var list = await Channel.Invoke<ModelBase[]>("sys.DesignService.LoadAllModel");
        return list ?? [];
    }

    public static Task<string?> LoadModelCodeAsync(ModelId modelId)
    {
        return Channel.Invoke<string>("sys.DesignService.LoadModelCode", [(long)modelId]);
    }

    public static async Task<ModelId> GenModelIdAsync(int appId, ModelType modelType, ModelLayer layer)
    {
        return await Channel.Invoke<long>("sys.DesignService.GenModelId", [appId, (int)modelType, (int)layer]);
    }
}