using System.Data;
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
    /// <summary>
    /// 加载暂存的模型代码，返回的是压缩过的
    /// </summary>
    private static async Task LoadCodeDataAsync(Stream toStream, ModelId modelId)
    {
        var developerId = RuntimeContext.CurrentSession!.LeafOrgUnitId;

#if FUTURE
            var q = new TableScan(Consts.SYS_STAGED_MODEL_ID);
            q.Filter(q.GetGuid(Consts.STAGED_DEVELOPERID_ID) == developerID &
                     q.GetString(Consts.STAGED_MODELID_ID) == modelId.ToString() &
                     q.GetByte(Consts.STAGED_TYPE_ID) == (byte)StagedType.SourceCode);
#else
        var db = SqlStore.Default;
        var esc = db.NameEscaper;
        await using var conn = await db.OpenConnectionAsync();
        await using var cmd = db.MakeCommand();
        cmd.Connection = conn;
        cmd.CommandText =
            $"Select {esc}Data{esc} From {esc}sys.StagedModel{esc} Where {esc}DeveloperId{esc}='{developerId}' And {esc}Type{esc}={(byte)StagedType.SourceCode} And {esc}Model{esc}='{modelId.ToString()}'";
        // Logger.Debug(cmd.CommandText);
        await using var reader = await cmd.ExecuteReaderAsync(CommandBehavior.SequentialAccess);
        if (await reader.ReadAsync())
        {
            await using var dataStream = reader.GetStream(0);
            await dataStream.CopyToAsync(toStream);
        }
#endif
    }

    internal static async Task<byte[]?> LoadCodeDataAsync(ModelId modelId) //TODO: remove this
    {
        using var ms = new MemoryStream(2048);
        await LoadCodeDataAsync(ms, modelId);
        return ms.GetBuffer();
    }

    /// <summary>
    /// 保存Staged模型
    /// </summary>
    internal static async Task SaveModelAsync(ModelBase model)
    {
        var data = MetaSerializer.SerializeMeta(model);
        await using var ms = new MemoryStream(data);
        await SaveAsync(StagedType.Model, model.Id.ToString(), ms);
    }

    /// <summary>
    /// 保存模型类型的根目录
    /// </summary>
    internal static async Task SaveFolderAsync(ModelFolder folder)
    {
        if (folder.Parent != null)
            throw new InvalidOperationException("仅允许保存模型类型的根目录");
        var data = MetaSerializer.SerializeMeta(folder);
        await using var ms = new MemoryStream(data);
        await SaveAsync(StagedType.Folder,
            $"{folder.AppId}-{(byte)folder.TargetModelType}" /*不要使用folder.Id*/, ms);
    }

    internal static async Task SaveCodeAsync(IAsyncEnumerable<IBlobChunk> stream, ModelId modelId, int chars)
    {
        var inputTempFilePath = Path.GetTempFileName();
        var inputTempFileStream = File.Open(inputTempFilePath, FileMode.Create, FileAccess.ReadWrite);
        try
        {
            await stream.WriteToStream(inputTempFileStream);
            inputTempFileStream.Seek(0, SeekOrigin.Begin);

            using var outputStream = new MemoryStream(2048);
            await ModelCodeUtil.CompressCode(inputTempFileStream, chars, outputStream);
            outputStream.Seek(0, SeekOrigin.Begin);
            await SaveAsync(StagedType.SourceCode, modelId.ToString(), outputStream);
        }
        finally
        {
            inputTempFileStream.Close();
            File.Delete(inputTempFilePath);
        }
    }

    internal static async Task<Stream> DownloadCodeAsync(ModelId modelId)
    {
        var inputTempFilePath = Path.GetTempFileName();
        var inputTempFileStream = File.Open(inputTempFilePath, FileMode.Create, FileAccess.ReadWrite);
        try
        {
            await LoadCodeDataAsync(inputTempFileStream, modelId);
            if (inputTempFileStream.Length == 0)
                return Stream.Null; //throw new Exception("Can't load staged code");

            inputTempFileStream.Seek(0, SeekOrigin.Begin);
            var outputTempFilePath = Path.GetTempFileName();
            var outputTempFileStream = File.Open(outputTempFilePath, FileMode.Create, FileAccess.ReadWrite);
            await ModelCodeUtil.DecompressCode(inputTempFileStream, outputTempFileStream);
            outputTempFileStream.Seek(0, SeekOrigin.Begin);
            return outputTempFileStream;
        }
        finally
        {
            inputTempFileStream.Close();
            File.Delete(inputTempFilePath);
        }
    }

    private static async Task SaveAsync(StagedType type, string modelId, Stream data)
    {
        var developerId = RuntimeContext.CurrentSession!.LeafOrgUnitId;

        //TODO:使用SelectForUpdate or BatchDelete
#if FUTURE
        var q = new TableScan(Consts.SYS_STAGED_MODEL_ID);
        byte typeValue = (byte)type;
        q.Filter(q.GetByte(Consts.STAGED_TYPE_ID) == typeValue &
            q.GetString(Consts.STAGED_MODELID_ID) == modelId &
            q.GetGuid(Consts.STAGED_DEVELOPERID_ID) == developerID);

        var txn = await Transaction.BeginAsync();
        var res = await q.ToListAsync();
        if (res.Count > 0)
        {
            for (var i = 0; i < res.Count; i++)
            {
                await EntityStore.DeleteEntityAsync(model, res[i].Id, txn);
            }
        }
        
        var obj = new StagedModel((byte)type, modelId, developerId) { Data = data };
        await EntityStore.InsertEntityAsync(obj, txn);
        await txn.CommitAsync();
#else
        await using var conn = await SqlStore.Default.OpenConnectionAsync();
        await using var txn = await conn.BeginTransactionAsync();
        //TODO:暂先删除再重新插入
        var esc = SqlStore.Default.NameEscaper;
        var pre = SqlStore.Default.ParameterPrefix;
        await using var delCmd = conn.CreateCommand();
        delCmd.CommandText =
            $"DELETE FROM {esc}sys.StagedModel{esc} WHERE {esc}DeveloperId{esc}={pre}devId AND {esc}Type{esc}={pre}type AND {esc}Model{esc}={pre}model";
        delCmd.AddParameter($"{pre}devId", DbType.Guid, developerId);
        delCmd.AddParameter($"{pre}type", DbType.Int16, (short)type);
        delCmd.AddParameter($"{pre}model", DbType.String, modelId);
        delCmd.Connection = conn;
        delCmd.Transaction = txn;
        await delCmd.ExecuteNonQueryAsync();

        var addCmd = conn.CreateCommand();
        addCmd.CommandText =
            $"INSERT INTO {esc}sys.StagedModel{esc} ({esc}DeveloperId{esc},{esc}Type{esc},{esc}Model{esc},{esc}Data{esc}) VALUES ({pre}devId, {pre}type,{pre}model,{pre}data)";
        addCmd.AddParameter($"{pre}devId", DbType.Guid, developerId);
        addCmd.AddParameter($"{pre}type", DbType.Int16, (short)type);
        addCmd.AddParameter($"{pre}model", DbType.String, modelId);
        addCmd.AddParameter($"{pre}data", DbType.Binary, -1, data);
        addCmd.Connection = conn;
        addCmd.Transaction = txn;
        await addCmd.ExecuteNonQueryAsync();
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
        q.Where(t => t.F("DeveloperId") == developerId & t.F("Type") <= (byte)StagedType.Folder);
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
        q.Where(t => t.F("DeveloperId") == developerId);
#endif
        var res = await q.ToListAsync(
            r => new PendingChange()
            {
                Type = (StagedType)r.ReadIntMember(0),
                Id = r.ReadStringMember(1)
            },
            t => [t.F("Type"), t.F("Model")]);
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
        q.Where(t => t.F("DeveloperId") == devId);
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
        q.Where(t => t.F("DeveloperId") == devId &
                     t.F("Model") == modelId.ToString());
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