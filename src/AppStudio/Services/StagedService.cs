using AppBoxClient;
using AppBoxCore;
using AppBoxStore;
using AppBoxStore.Entities;

namespace AppBoxDesign;

/// <summary>
/// 管理设计时临时保存的尚未发布的模型及相关代码
/// </summary>
internal sealed class StagedService : IStagedService
{
    public async Task<StagedItems> LoadStagedAsync()
    {
        var list = await Channel.Invoke<IList<Entity>>("sys.DesignService.StageLoadAll", null,
            [new EntityFactory(StagedModel.MODELID, typeof(StagedModel))]);
        return list == null ? new StagedItems([]) : new StagedItems(list.Cast<StagedModel>().ToList());
    }

    public Task<IList<PendingChange>> LoadChangesAsync()
    {
        return Channel.Invoke<IList<PendingChange>>("sys.DesignService.StageLoadChanges")!;
    }

    public Task<string?> LoadCodeAsync(ModelId modelId)
    {
        return Channel.Invoke<string>("sys.DesignService.StageLoadCode", [(long)modelId]);
    }

    public Task SaveFolderAsync(ModelFolder folder)
    {
        return Channel.Invoke("sys.DesignService.StageSaveFolder", [folder]);
    }

    public Task SaveModelAsync(ModelBase model)
    {
        return Channel.Invoke("sys.DesignService.StageSaveModel", [model]);
    }

    public Task SaveCodeAsync(ModelId modelId, string sourceCode)
    {
        return Channel.Invoke("sys.DesignService.StageSaveCode", [(long)modelId, sourceCode]);
    }

    public Task DeleteModelAsync(ModelId modelId)
    {
        return Channel.Invoke("sys.DesignService.StageDeleteModel", [(long)modelId]);
    }
}