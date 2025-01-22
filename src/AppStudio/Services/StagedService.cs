using AppBoxClient;
using AppBoxCore;
using AppBoxStore;
using AppBoxStore.Entities;

namespace AppBoxDesign;

/// <summary>
/// 管理设计时临时保存的尚未发布的模型及相关代码
/// </summary>
internal static class StagedService
{
    internal static async Task<StagedItems> LoadStagedAsync(bool onlyModelsAndFolders)
    {
        var list = await Channel.Invoke<IList<Entity>>("sys.DesignService.StageLoadAll",
            [onlyModelsAndFolders],
            [new EntityFactory(StagedModel.MODELID, typeof(StagedModel))]);
        return list == null ? new StagedItems([]) : new StagedItems(list.Cast<StagedModel>().ToList());
    }

    internal static Task<string?> LoadCodeAsync(ModelId modelId)
    {
        return Channel.Invoke<string>("sys.DesignService.StageLoadCode", [(long)modelId]);
    }

    internal static Task SaveFolderAsync(ModelFolder folder)
    {
        return Channel.Invoke("sys.DesignService.StageSaveFolder", [folder]);
    }

    internal static Task SaveModelAsync(ModelBase model)
    {
        return Channel.Invoke("sys.DesignService.StageSaveModel", [model]);
    }

    internal static Task SaveCodeAsync(ModelId modelId, string sourceCode)
    {
        return Channel.Invoke("sys.DesignService.StageSaveCode", [(long)modelId, sourceCode]);
    }
}

internal sealed class StagedItems
{
    internal object[]? Items { get; }

    internal StagedItems(IList<StagedModel> staged)
    {
        if (staged.Count <= 0) return;

        Items = new object[staged.Count];

        for (var i = 0; i < staged.Count; i++)
        {
            var type = (StagedType)staged[i].Type;
            var data = staged[i].Data;
            switch (type)
            {
                case StagedType.Model:
                {
                    ModelId modelId = staged[i].ModelIdString;
                    Items[i] = MetaSerializer.DeserializeMeta(data,
                        () => ModelFactory.Make(modelId.Type));
                    break;
                }
                case StagedType.Folder:
                    Items[i] = MetaSerializer.DeserializeMeta(data, () => new ModelFolder());
                    break;
                case StagedType.SourceCode:
                {
                    ModelId modelId = staged[i].ModelIdString;
                    Items[i] = new StagedSourceCode { ModelId = modelId, CodeData = data };
                    break;
                }
                default:
                    throw new NotImplementedException();
            }
        }
    }

    internal ModelBase[] FindNewModels()
    {
        var list = new List<ModelBase>();
        if (Items == null) return list.ToArray();

        foreach (var item in Items)
        {
            if (item is ModelBase { PersistentState: PersistentState.Detached } m)
                list.Add(m);
        }

        return list.ToArray();
    }

    internal ModelBase? FindModel(ModelId modelId)
    {
        if (Items == null) return null;

        foreach (var item in Items)
        {
            if (item is ModelBase m && m.Id == modelId)
                return m;
        }

        return null;
    }

    /// <summary>
    /// 用挂起的文件夹更新从存储加载的文件夹
    /// </summary>
    internal void UpdateFolders(List<ModelFolder> storedFolders)
    {
        if (Items == null) return;
        for (int i = 0; i < Items.Length; i++)
        {
            if (Items[i] is ModelFolder folder)
            {
                var index = storedFolders.FindIndex(t =>
                    t.AppId == folder.AppId && t.TargetModelType == folder.TargetModelType);
                if (index < 0)
                    storedFolders.Add(folder);
                else
                    storedFolders[index] = folder;
            }
        }
    }

    /// <summary>
    /// 从存储加载的模型中移除已删除的
    /// </summary>
    internal void RemoveDeletedModels(List<ModelBase> storedModels)
    {
        if (Items == null || Items.Length == 0)
            return;

        for (int i = 0; i < Items.Length; i++)
        {
            if (Items[i] is ModelBase m && m.PersistentState == PersistentState.Deleted)
            {
                storedModels.RemoveAll(t => t.Id == m.Id);
            }
        }
    }

    internal sealed class StagedSourceCode
    {
        public ModelId ModelId;
        public byte[] CodeData;
    }
}