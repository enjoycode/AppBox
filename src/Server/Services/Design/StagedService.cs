using AppBoxCore;
using AppBoxDesign;
using AppBoxStore;
using AppBoxStore.Entities;

namespace AppBoxServer.Design;

/// <summary>
/// 管理设计时临时保存的尚未发布的模型及相关代码(服务端实现)
/// </summary>
internal static class StagedService
{
    internal static async Task<byte[]?> LoadCodeDataAsync(ModelId modelId)
    {
        var developerId = RuntimeContext.CurrentSession!.LeafOrgUnitId;

#if FUTURE
            var q = new TableScan(Consts.SYS_STAGED_MODEL_ID);
            q.Filter(q.GetGuid(Consts.STAGED_DEVELOPERID_ID) == developerID &
                     q.GetString(Consts.STAGED_MODELID_ID) == modelId.ToString() &
                     q.GetByte(Consts.STAGED_TYPE_ID) == (byte)StagedType.SourceCode);
#else
        var q = new SqlQuery<StagedModel>(StagedModel.MODELID);
        q.Where(t => t["DeveloperId"] == developerId &
                     t["Model"] == modelId.ToString() &
                     t["Type"] == (byte)StagedType.SourceCode);
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
        q.Where(t => t["Type"] == (byte)type &
                     t["Model"] == modelId &
                     t["DeveloperId"] == developerID);

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
    /// 用于DesignTree加载时加载挂起的项目，排除代码
    /// </summary>
    internal static async Task<IList<StagedModel>> LoadStagedAsync()
    {
        //TODO:考虑用于DesignTree加载时连服务模型的代码一并加载
        var developerId = RuntimeContext.CurrentSession!.LeafOrgUnitId;

#if FUTURE
        var q = new TableScan(Consts.SYS_STAGED_MODEL_ID);
        q.Filter(q.GetGuid(Consts.STAGED_DEVELOPERID_ID) == developerID &
                q.GetByte(Consts.STAGED_TYPE_ID) <= (byte)StagedType.Folder);
#else
        var q = new SqlQuery<StagedModel>(StagedModel.MODELID);
        q.Where(t => t["DeveloperId"] == developerId & t["Type"] <= (byte)StagedType.Folder);
#endif
        var res = await q.ToListAsync();
        return res;
    }

    /// <summary>
    /// 用于发布时加载所有挂起的项目
    /// </summary>
    internal static async Task<IList<PendingChange>> LoadChangesAsync()
    {
        var developerId = RuntimeContext.CurrentSession!.LeafOrgUnitId;

#if FUTURE
        var q = new TableScan(Consts.SYS_STAGED_MODEL_ID);
        q.Filter(q.GetGuid(Consts.STAGED_DEVELOPERID_ID) == developerID);
#else
        var q = new SqlQuery<StagedModel>(StagedModel.MODELID);
        q.Where(t => t["DeveloperId"] == developerId);
#endif
        var res = await q.ToListAsync(
            r => new PendingChange()
            {
                Type = (StagedType)r.ReadIntMember(0),
                Id = r.ReadStringMember(1)
            },
            t => [t["Type"], t["Model"]]);
        return res;
    }

    /// <summary>
    /// 发布时删除当前会话下所有挂起
    /// </summary>
    internal static async Task DeleteStagedAsync(System.Data.Common.DbTransaction txn)
    {
        //TODO:****暂查询再删除, use BatchDelete
        var devId = RuntimeContext.CurrentSession!.LeafOrgUnitId;
#if FUTURE
            var q = new TableScan(Consts.SYS_STAGED_MODEL_ID);
            q.Filter(q.GetGuid(Consts.STAGED_DEVELOPERID_ID) == devId);
#else
        var q = new SqlQuery<StagedModel>(StagedModel.MODELID);
        q.Where(t => t["DeveloperId"] == devId);
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
        q.Where(t => t["DeveloperId"] == devId &
                     t["Model"] == modelId.ToString());
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