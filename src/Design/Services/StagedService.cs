using AppBoxCore;
using AppBoxStore;

namespace AppBoxDesign;

/// <summary>
/// 管理设计时临时保存的尚未发布的模型及相关代码
/// </summary>
internal static class StagedService
{
    private static async Task<byte[]?> LoadCodeDataAsync(ModelId modelId)
    {
        var developerID = RuntimeContext.CurrentSession!.LeafOrgUnitId;

#if FUTURE
            var q = new TableScan(Consts.SYS_STAGED_MODEL_ID);
            q.Filter(q.GetGuid(Consts.STAGED_DEVELOPERID_ID) == developerID &
                     q.GetString(Consts.STAGED_MODELID_ID) == modelId.ToString() &
                     q.GetByte(Consts.STAGED_TYPE_ID) == (byte)StagedType.SourceCode);
#else
        var q = new SqlQuery<StagedModel>(StagedModel.MODELID);
        q.Where(q.T["DeveloperId"] == developerID &
                q.T["Model"] == modelId.ToString() &
                q.T["Type"] == (byte)StagedType.SourceCode);
#endif
        var res = await q.ToListAsync(); //TODO: ToSingleAsync()
        return res.Count == 0 ? null : res[0].Data;
    }

    /// <summary>
    /// 保存Staged模型
    /// </summary>
    internal static Task SaveModelAsync(ModelBase model)
    {
        var data = MetaSerializer.SerializeMeta(model);
        return SaveAsync(StagedType.Model, model.Id.ToString(), data);
    }

    /// <summary>
    /// 保存模型类型的根目录
    /// </summary>
    internal static Task SaveFolderAsync(ModelFolder folder)
    {
        if (folder.Parent != null)
            throw new InvalidOperationException("仅允许保存模型类型的根目录");
        var data = MetaSerializer.SerializeMeta(folder);
        return SaveAsync(StagedType.Folder,
            $"{folder.AppId}-{(byte)folder.TargetModelType}" /*不要使用folder.Id*/, data);
    }


    internal static Task SaveCodeAsync(ModelId modelId, string sourceCode)
    {
        var data = ModelCodeUtil.CompressCode(sourceCode);
        return SaveAsync(StagedType.SourceCode, modelId.ToString(), data);
    }

    internal static async Task<string?> LoadCodeAsync(ModelId modelId)
    {
        var data = await LoadCodeDataAsync(modelId);
        return data == null ? null : ModelCodeUtil.DecompressCode(data);
    }

    /// <summary>
    /// 专用于保存视图模型的Web运行时代码
    /// </summary>
    internal static Task SaveViewWebCodeAsync(ModelId modelId, string runtimeCode)
    {
        if (string.IsNullOrEmpty(runtimeCode))
            return Task.CompletedTask;

        var data = ModelCodeUtil.CompressCode(runtimeCode);
        return SaveAsync(StagedType.ViewRuntimeCode, modelId.ToString(), data);
    }

    /// <summary>
    /// 专用于加载视图模型的Web运行时代码
    /// </summary>
    internal static async Task<string?> LoadViewWebCode(ModelId viewModelId)
    {
        var developerID = RuntimeContext.CurrentSession!.LeafOrgUnitId;

#if FUTURE
            var q = new TableScan(Consts.SYS_STAGED_MODEL_ID);
            q.Filter(q.GetGuid(Consts.STAGED_DEVELOPERID_ID) == developerID &
                     q.GetString(Consts.STAGED_MODELID_ID) == viewModelId.ToString() &
                     q.GetByte(Consts.STAGED_TYPE_ID) == (byte)StagedType.ViewRuntimeCode);
#else
        var q = new SqlQuery<StagedModel>(StagedModel.MODELID);
        q.Where(q.T["DeveloperId"] == developerID &
                q.T["Model"] == viewModelId.ToString() &
                q.T["Type"] == (byte)StagedType.ViewRuntimeCode);
#endif
        var res = await q.ToListAsync();
        return res.Count == 0 ? null : ModelCodeUtil.DecompressCode(res[0].Data);
    }

    private static async Task SaveAsync(StagedType type, string modelId, byte[] data)
    {
        var developerID = RuntimeContext.CurrentSession!.LeafOrgUnitId;

        //TODO:使用SelectForUpdate or BatchDelete

#if FUTURE
            var q = new TableScan(Consts.SYS_STAGED_MODEL_ID);
            byte typeValue = (byte)type;
            q.Filter(q.GetByte(Consts.STAGED_TYPE_ID) == typeValue &
                q.GetString(Consts.STAGED_MODELID_ID) == modelId &
                q.GetGuid(Consts.STAGED_DEVELOPERID_ID) == developerID);

            var txn = await Transaction.BeginAsync();
#else
        var q = new SqlQuery<StagedModel>(StagedModel.MODELID);
        q.Where(q.T["Type"] == (byte)type &
                q.T["Model"] == modelId &
                q.T["DeveloperId"] == developerID);

        await using var conn = await SqlStore.Default.OpenConnectionAsync();
        await using var txn = await conn.BeginTransactionAsync();
#endif

        var res = await q.ToListAsync();
        if (res.Count > 0)
        {
            //TODO:*****临时先删除再重新插入
            for (var i = 0; i < res.Count; i++)
            {
#if FUTURE
                    await EntityStore.DeleteEntityAsync(model, res[i].Id, txn);
#else
                await SqlStore.Default.DeleteAsync(res[i], txn);
#endif
            }
        }

        var obj = new StagedModel((byte)type, modelId, developerID) { Data = data };
#if FUTURE
            await EntityStore.InsertEntityAsync(obj, txn);
            await txn.CommitAsync();
#else
        await SqlStore.Default.InsertAsync(obj, txn);
        await txn.CommitAsync();
#endif
    }

    /// <summary>
    /// 加载挂起项目
    /// </summary>
    /// <param name="onlyModelsAndFolders">true用于DesignTree加载; false用于发布时加载</param>
    internal static async Task<StagedItems> LoadStagedAsync(bool onlyModelsAndFolders)
    {
        //TODO:考虑用于DesignTree加载时连服务模型的代码一并加载
        var developerID = RuntimeContext.CurrentSession!.LeafOrgUnitId;

#if FUTURE
            var q = new TableScan(Consts.SYS_STAGED_MODEL_ID);
            if (onlyModelsAndFolders)
                q.Filter(q.GetGuid(Consts.STAGED_DEVELOPERID_ID) == developerID &
                         q.GetByte(Consts.STAGED_TYPE_ID) <= (byte)StagedType.Folder);
            else
                q.Filter(q.GetGuid(Consts.STAGED_DEVELOPERID_ID) == developerID);
#else
        var q = new SqlQuery<StagedModel>(StagedModel.MODELID);
        if (onlyModelsAndFolders)
            q.Where(q.T["DeveloperId"] == developerID & q.T["Type"] <= (byte)StagedType.Folder);
        else
            q.Where(q.T["DeveloperId"] == developerID);
#endif
        var res = await q.ToListAsync();
        return new StagedItems(res);
    }

    /// <summary>
    /// 发布时删除当前会话下所有挂起
    /// </summary>
    internal static async Task DeleteStagedAsync(
#if FUTURE
            Transaction txn
#else
        System.Data.Common.DbTransaction txn
#endif
    )
    {
        //TODO:****暂查询再删除, use BatchDelete
        var devId = RuntimeContext.CurrentSession!.LeafOrgUnitId;
#if FUTURE
            var q = new TableScan(Consts.SYS_STAGED_MODEL_ID);
            q.Filter(q.GetGuid(Consts.STAGED_DEVELOPERID_ID) == devId);
#else
        var q = new SqlQuery<StagedModel>(StagedModel.MODELID);
        q.Where(q.T["DeveloperId"] == devId);
#endif
        var list = await q.ToListAsync();
        for (var i = 0; i < list.Count; i++)
        {
#if FUTURE
                await EntityStore.DeleteEntityAsync(model, list[i].Id, txn);
#else
            await SqlStore.Default.DeleteAsync(list[i], txn);
#endif
        }
    }

    /// <summary>
    /// 删除挂起的模型及相关
    /// </summary>
    internal static async Task DeleteModelAsync(ModelId modelId)
    {
        //TODO:***暂查询再删除
        var devId = RuntimeContext.CurrentSession!.LeafOrgUnitId;
        //删除模型
#if FUTURE
            var q = new TableScan(Consts.SYS_STAGED_MODEL_ID);
            q.Filter(q.GetGuid(Consts.STAGED_DEVELOPERID_ID) == devId
                & q.GetString(Consts.STAGED_MODELID_ID) == modelId.ToString());
#else
        var q = new SqlQuery<StagedModel>(StagedModel.MODELID);
        q.Where(q.T["DeveloperId"] == devId &
                q.T["Model"] == modelId.ToString());
#endif
        var list = await q.ToListAsync();
        for (var i = 0; i < list.Count; i++)
        {
#if FUTURE
                await EntityStore.DeleteAsync(list[i]);
#else
            await SqlStore.Default.DeleteAsync(list[i], null);
#endif
        }
    }
}

/// <summary>
/// 用于区分Staged.Data内存储的数据类型
/// </summary>
internal enum StagedType : byte
{
    Model = 0, //模型序列化数据
    Folder, //文件夹
    SourceCode, //服务模型或视图模型的源代码 //TODO:考虑按类型分开
    ViewRuntimeCode, //仅用于视图模型前端编译好的运行时脚本代码
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
                case StagedType.ViewRuntimeCode:
                {
                    ModelId modelId = staged[i].ModelIdString;
                    Items[i] = new StagedViewRuntimeCode { ModelId = modelId, CodeData = data };
                }
                    break;
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

    internal sealed class StagedViewRuntimeCode
    {
        public ModelId ModelId;
        public byte[] CodeData;
    }
}