using AppBoxClient;
using AppBoxCore;
using AppBoxCore.Channel;
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

    public async Task DownloadCodeAsync(Stream toStream, ModelId modelId)
    {
        var reader = new BytesPipeReader();
        await Channel.Download("sys.DesignService.StageLoadCode", reader, (long)modelId);
        await reader.CopyToStreamAsync(toStream);
    }

    public Task SaveFolderAsync(ModelFolder folder) =>
        Channel.Invoke("sys.DesignService.StageSaveFolder", AnyValue.From(folder));

    public Task SaveModelAsync(ModelBase model) =>
        Channel.Invoke("sys.DesignService.StageSaveModel", AnyValue.From(model));

    public Task SaveCodeAsync(ModelId modelId, Stream code)
    {
        var pipeWriter = new BytesPipeWriter(w => w.CopyFromAsync(code));
        return Channel.Upload("sys.DesignService.StageSaveCode", pipeWriter, (long)modelId);
    }

    public Task DeleteModelAsync(ModelId modelId) =>
        Channel.Invoke("sys.DesignService.StageDeleteModel", (long)modelId);
}