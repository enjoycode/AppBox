using AppBoxCore;
using AppBoxStore;
using AppBoxStore.Entities;

namespace AppBoxDesign;

public interface IStagedService
{
    Task<StagedItems> LoadStagedAsync();

    Task<IList<PendingChange>> LoadChangesAsync();

    Task<string?> LoadCodeAsync(ModelId modelId);

    Task SaveFolderAsync(ModelFolder folder);

    Task SaveModelAsync(ModelBase model);

    Task SaveCodeAsync(ModelId modelId, string sourceCode);

    Task DeleteModelAsync(ModelId modelId);
}

public sealed class StagedItems
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
                    Items[i] = MetaSerializer.DeserializeMeta(data, () => ModelFactory.Make(modelId.Type));
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
        for (var i = 0; i < Items.Length; i++)
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

        for (var i = 0; i < Items.Length; i++)
        {
            if (Items[i] is ModelBase m && m.PersistentState == PersistentState.Deleted)
            {
                DesignHub.Current.AddRemovedItem(m);
                storedModels.RemoveAll(t => t.Id == m.Id);
            }
        }
    }

    internal sealed class StagedSourceCode
    {
        public ModelId ModelId;
        public byte[] CodeData = null!;
    }
}