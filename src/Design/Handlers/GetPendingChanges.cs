using AppBoxCore;

namespace AppBoxDesign;

/// <summary>
/// 获取当前所有挂起的变更
/// </summary>
internal sealed class GetPendingChanges : IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        //TODO: 暂重新加载(因模型指向问题)
        var staged = await StagedService.LoadStagedAsync(onlyModelsAndFolders: false);
        hub.PendingChanges = staged.Items;
        if (hub.PendingChanges == null || hub.PendingChanges.Length == 0)
            return AnyValue.Empty;

        var res = new ChangedInfo[hub.PendingChanges.Length];
        for (var i = 0; i < hub.PendingChanges.Length; i++)
        {
            if (hub.PendingChanges[i] is ModelBase model)
                res[i] = new ChangedInfo(model.ModelType.ToString(), model.Name);
            else if (hub.PendingChanges[i] is ModelFolder folder)
                res[i] = new ChangedInfo("Folder", folder.TargetModelType.ToString());
            else
                throw new NotImplementedException(hub.PendingChanges[i].GetType().ToString());
        }

        return AnyValue.From(res);
    }
}

internal readonly struct ChangedInfo
{
    public readonly string ModelType;
    public readonly string ModelId;

    public ChangedInfo(string modelType, string modelId)
    {
        ModelType = modelType;
        ModelId = modelId;
    }
}