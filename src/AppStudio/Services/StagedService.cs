using AppBoxClient;
using AppBoxCore;
using AppBoxStore.Entities;

namespace AppBoxDesign;

/// <summary>
/// 管理设计时临时保存的尚未发布的模型及相关代码
/// </summary>
internal sealed class StagedService : IStagedService
{
    public async Task<StagedItems> LoadStagedAsync()
    {
        var list = await Channel.Invoke<IList<StagedModel>>("sys.DesignService.StageLoadAll",
            [new EntityFactory(StagedModel.MODELID, typeof(StagedModel))]);
        return new StagedItems(list!.ToList());
    }

    public Task DownloadCodeAsync(Stream toStream, ModelId modelId) =>
        Channel.Download("sys.DesignService.StageLoadCode", toStream, (long)modelId);

    public Task SaveFolderAsync(ModelFolder folder) =>
        Channel.Invoke("sys.DesignService.StageSaveFolder", AnyValue.From(folder));

    public Task SaveModelAsync(ModelBase model) =>
        Channel.Invoke("sys.DesignService.StageSaveModel", AnyValue.From(model));

    public Task SaveCodeAsync(ModelId modelId, Stream code) =>
        Channel.Upload("sys.DesignService.StageSaveCode", code, (long)modelId);

    public Task DeleteModelAsync(ModelId modelId) =>
        Channel.Invoke("sys.DesignService.StageDeleteModel", (long)modelId);
}