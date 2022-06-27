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

        var res = new List<ChangedModel>();
        //仅向前端返回Model及Folder
        foreach (var item in hub.PendingChanges)
        {
            if (item is ModelBase model)
                res.Add(new ChangedModel
                    { ModelType = model.ModelType.ToString(), ModelId = model.Name });
            else if (item is ModelFolder folder)
                res.Add(new ChangedModel
                    { ModelType = "Folder", ModelId = folder.TargetModelType.ToString() });
        }

        return AnyValue.From(res.ToArray());
    }
}