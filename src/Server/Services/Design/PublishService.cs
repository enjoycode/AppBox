using System.Data.Common;
using System.IO.Compression;
using AppBoxCore;
using AppBoxDesign;
using AppBoxStore;

namespace AppBoxServer.Design;

internal static class PublishService
{
    /// <summary>
    /// 1. 保存模型(包括编译好的服务Assembly)，并生成EntityModel的SchemaChangeJob;
    /// 2. 通知集群各节点更新缓存;
    /// 3. 删除当前会话的CheckoutInfo;
    /// 4. 保存递交日志
    /// </summary>
    internal static async Task PublishAsync(PublishPackage package, string? commitMessage)
    {
        //先根据依赖关系排序
        package.SortAllModels();

        //注意: 目前实现无法保证第三方数据库与内置模型存储的一致性,第三方数据库发生异常只能手动清理
        var otherStoreTxns = new Dictionary<long, DbTransaction>();

#if FUTURE
        var txn = await Transaction.BeginAsync();
#else
        var txn = await SqlStore.Default.BeginTransactionAsync();
        otherStoreTxns.Add(SqlStore.DefaultSqlStoreId, txn);
#endif

        //TODO:考虑发布锁
        var container = new PublishContainer(package);
        try
        {
            await SaveModelsAsync(container, txn, otherStoreTxns);

            await CheckoutService.CheckinAsync(txn);

            // //注意必须先刷新后清除缓存，否则删除的节点在移除后会自动保存
            // //刷新所有CheckoutByMe的节点项
            // hub.DesignTree.CheckinAllNodes();
            //清除所有签出缓存
            await StagedService.DeleteStagedAsync(txn);

            //先尝试递交第三方数据库的DDL事务
            foreach (var sqlTxn in otherStoreTxns.Values)
            {
                var sqlConn = sqlTxn.Connection;
                await sqlTxn.CommitAsync();
                sqlConn?.Dispose();
            }

#if FUTURE
            //再递交系统数据库事务
            await txn.CommitAsync();
#endif
        }
        finally
        {
#if FUTURE
            txn.Dispose();
#endif
            foreach (var sqlTxn in otherStoreTxns.Values)
            {
                var sqlConn = sqlTxn.Connection;
                await sqlTxn.DisposeAsync();
                sqlConn?.Dispose();
            }
        }

        //最后通知各节点更新模型缓存
        InvalidModelsCache(package);
    }

    private static async ValueTask<DbTransaction> MakeOtherStoreTxn(long storeId, IDictionary<long, DbTransaction> txns)
    {
        if (!txns.TryGetValue(storeId, out var txn))
        {
            var sqlStore = SqlStore.Get(storeId);
            var conn = sqlStore.MakeConnection();
            await conn.OpenAsync();
            txn = await conn.BeginTransactionAsync();
            txns[storeId] = txn;
        }

        return txn;
    }

    private static async Task SaveModelsAsync(PublishContainer container, DbTransaction txn,
        IDictionary<long, DbTransaction> otherStoreTxns)
    {
        var package = container.Package;
        //保存文件夹
        foreach (var folder in package.Folders)
        {
            if (folder.IsDeleted)
                await MetaStore.Provider.DeleteFolderAsync(folder, txn);
            else
                await MetaStore.Provider.UpsertFolderAsync(folder, txn);
        }

        //保存模型，注意:
        //1.映射至系统存储的实体模型的变更与删除暂由MetaStore处理，映射至SqlStore的DDL暂在这里处理
        //2.删除的模型同时删除相关代码及编译好的组件，包括视图模型的相关路由
        foreach (var model in package.Models)
        {
            switch (model.PersistentState)
            {
                case PersistentState.Detached:
                {
                    await MetaStore.Provider.InsertModelAsync(model, txn);
                    if (model.ModelType == ModelType.Entity)
                        await TryCreateTable(container, (EntityModel)model, otherStoreTxns);
                    break;
                }
                case PersistentState.Unchanged: //TODO:临时
                case PersistentState.Modified:
                {
                    await MetaStore.Provider.UpdateModelAsync(model, txn, container.GetApplicationModel);
                    if (model.ModelType == ModelType.Entity)
                        await TryAlterTable(container, (EntityModel)model, otherStoreTxns);

                    //TODO:服务模型重命名删除旧的Assembly
                    break;
                }
                case PersistentState.Deleted:
                {
                    await MetaStore.Provider.DeleteModelAsync(model, txn, container.GetApplicationModel);

                    if (model.ModelType == ModelType.Entity)
                    {
                        await TryDropTable(container, (EntityModel)model, otherStoreTxns);
                    }
                    //判断模型类型删除相关代码及编译好的组件
                    else if (model.ModelType == ModelType.Service)
                    {
                        var app = container.GetApplicationModel(model.AppId);
                        await MetaStore.Provider.DeleteModelCodeAsync(model.Id, txn);
                        await MetaStore.Provider.DeleteAssemblyAsync(MetaAssemblyType.Service,
                            $"{app.Name}.{model.OriginalName}", txn);
                    }
                    else if (model.ModelType == ModelType.View)
                    {
                        // var app = container.GetApplicationModel(model.AppId);
                        // var oldViewName = $"{app.Name}.{model.OriginalName}";
                        await MetaStore.Provider.DeleteModelCodeAsync(model.Id, txn);
                        // await ModelStore.DeleteAssemblyAsync(MetaAssemblyType.View, oldViewName, txn);
                    }
                }
                    break;
            }
        }

        //保存模型相关的代码
        foreach (var modelId in package.SourceCodes.Keys)
        {
            var code = package.SourceCodes[modelId];
            if (code != null)
            {
                var codeData = ModelCodeUtil.CompressCode(code);
                await MetaStore.Provider.UpsertModelCodeAsync(modelId, codeData, txn);
            }
        }

        //保存服务模型编译好的运行时组件
        foreach (var serviceName in package.ServiceAssemblies.Keys)
        {
            var asmData = CompressAssemblyData(package.ServiceAssemblies[serviceName]);
            await MetaStore.Provider.UpsertAssemblyAsync(MetaAssemblyType.Service, serviceName, asmData, txn);
        }

        //暂保留保存视图模型编译好的运行时代码
        // foreach (var viewName in package.ViewAssemblies.Keys)
        // {
        //     var asmData = package.ViewAssemblies[viewName];
        //     await MetaStore.Provider.UpsertAssemblyAsync(MetaAssemblyType.View, viewName, asmData, txn);
        // }
    }

    private static byte[] CompressAssemblyData(byte[] asmData)
    {
        using var ms = new MemoryStream(1024);
        using var cs = new BrotliStream(ms, CompressionMode.Compress, true);
        cs.Write(asmData, 0, asmData.Length);
        cs.Flush();
        return ms.ToArray();
    }

    private static bool IsDbFirstSqlStore(PublishContainer container, EntityModel model)
    {
        var storeId = model.SqlStoreOptions!.StoreModelId;
        if (storeId == SqlStore.DefaultSqlStoreId)
            return false;

        //TODO:*** fix this
        // if (hub.DesignTree.FindNode(DesignNodeType.DataStoreNode, storeId) is not DataStoreNode storeNode)
        //     throw new Exception("Can't find DataStore node for Entity");
        // return storeNode.Model.IsDbFirst;

        return false;
    }

    private static async ValueTask TryCreateTable(PublishContainer container, EntityModel model,
        IDictionary<long, DbTransaction> otherStoreTxns)
    {
        if (model.SqlStoreOptions != null) //映射至第三方数据库的需要创建相应的表
        {
            if (IsDbFirstSqlStore(container, model)) return; //忽略DbFirst

            var sqlStore = SqlStore.Get(model.SqlStoreOptions.StoreModelId);
            var sqlTxn = await MakeOtherStoreTxn(model.SqlStoreOptions.StoreModelId, otherStoreTxns);
            await sqlStore.CreateTableAsync(model, sqlTxn, container);
        }
        // else if (em.CqlStoreOptions != null)
        // {
        //     var cqlStore = CqlStore.Get(em.CqlStoreOptions.StoreModelId);
        //     await cqlStore.CreateTableAsync(em);
        // }
    }

    private static async ValueTask TryAlterTable(PublishContainer container, EntityModel model,
        IDictionary<long, DbTransaction> otherStoreTxns)
    {
        if (model.SqlStoreOptions != null) //映射至第三方数据库的需要变更表
        {
            if (IsDbFirstSqlStore(container, model)) return; //忽略DbFirst

            var sqlStore = SqlStore.Get(model.SqlStoreOptions.StoreModelId);
            var sqlTxn = await MakeOtherStoreTxn(model.SqlStoreOptions.StoreModelId, otherStoreTxns);
            await sqlStore.AlterTableAsync(model, sqlTxn, container);
        }
        // else if (em.CqlStoreOptions != null)
        // {
        //     var cqlStore = CqlStore.Get(em.CqlStoreOptions.StoreModelId);
        //     await cqlStore.AlterTableAsync(em);
        // }
    }

    private static async ValueTask TryDropTable(PublishContainer container, EntityModel model,
        IDictionary<long, DbTransaction> otherStoreTxns)
    {
        if (model.SqlStoreOptions != null) //映射至第三方数据库的需要删除相应的表
        {
            if (IsDbFirstSqlStore(container, model)) return; //忽略DbFirst

            var sqlStore = SqlStore.Get(model.SqlStoreOptions.StoreModelId);
            var sqlTxn = await MakeOtherStoreTxn(model.SqlStoreOptions.StoreModelId, otherStoreTxns);
            await sqlStore.DropTableAsync(model, sqlTxn, container);
        }
        // else if (em.CqlStoreOptions != null)
        // {
        //     var cqlStore = CqlStore.Get(em.CqlStoreOptions.StoreModelId);
        //     await cqlStore.DropTableAsync(em);
        // }
    }

    /// <summary>
    /// 通知各节点模型缓存失效
    /// </summary>
    private static void InvalidModelsCache(PublishPackage package)
    {
        if (package.Models.Count == 0)
            return;

        var others = package.Models
            .Where(t => t.ModelType != ModelType.Service)
            .Select(t => t.Id)
            .ToArray();
        var serviceModels = package.Models
            .Where(t => t.ModelType == ModelType.Service)
            .Cast<ServiceModel>()
            .ToArray();
        var services = new string[serviceModels.Length];
        for (var i = 0; i < serviceModels.Length; i++)
        {
            var serviceModel = serviceModels[i];
            var app = RuntimeContext.GetApplication(serviceModel.AppId);
            services[i] = serviceModels[i].IsNameChanged
                ? $"{app.Name}.{serviceModel.OriginalName}"
                : $"{app.Name}.{serviceModel.Name}";
        }

        RuntimeContext.Current.InvalidModelsCache(services, others, true);
    }

    #region ====Publish Client App Assemblies====

    private static string GetUploadAppPath()
    {
        var sessionName = RuntimeContext.Current.CurrentSession!.Name;
        return Path.Combine(Path.GetTempPath(), "AppBox", sessionName);
    }

    internal static void BeginUploadApp()
    {
        var tempPath = GetUploadAppPath();
        if (Directory.Exists(tempPath))
            Directory.Delete(tempPath, true);

        Directory.CreateDirectory(tempPath);
    }

    /// <summary>
    /// 将客户端上传的编译且压缩好的AppAssembly保存至临时目录
    /// </summary>
    internal static async Task UploadAppAssembly(InvokeArgs args)
    {
        var rs = args.Stream!;
        var assemblyName = rs.ReadString()!;

        var tempPath = GetUploadAppPath();
        var filePath = Path.Combine(tempPath, assemblyName);
        await using var fs = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.None);
        await rs.CopyToAsync(fs);
        await fs.FlushAsync();
        Log.Debug($"Upload to: {filePath} {fs.Length}");
    }

    /// <summary>
    /// 保存客户端上传的视图Assembly的依赖Map，并且开始保存App
    /// </summary>
    internal static async Task UploadViewAssemblyMap(InvokeArgs args)
    {
        //读取映射表
        var rs = args.Stream!;
        var count = rs.ReadVariant();
        var viewAssemblyMap = new List<MapItem>(count);
        for (var i = 0; i < count; i++)
        {
            var asmFlag = (AssemblyFlag)rs.ReadByte();
            var asmName = rs.ReadString()!;
            var dataLen = rs.ReadVariant();
            var data = new byte[dataLen];
            rs.ReadBytes(data);
            viewAssemblyMap.Add(new MapItem(asmName, asmFlag, data));
        }

        //读取之前上传的组件
        var tempPath = GetUploadAppPath();
        var allAssemblies = new Dictionary<string, byte[]>();
        foreach (var file in Directory.EnumerateFiles(tempPath))
        {
            allAssemblies.Add(Path.GetFileName(file), await File.ReadAllBytesAsync(file));
        }

        //开始事务保存
        await using var txn = await SqlStore.Default.BeginTransactionAsync();
        //先清除旧的
        await MetaStore.Provider.DeleteAllAppAssembliesAsync(txn);
        //保存程序集
        foreach (var assemblyInfo in allAssemblies)
        {
            await MetaStore.Provider.UpsertAssemblyAsync(MetaAssemblyType.ClientApp, assemblyInfo.Key,
                assemblyInfo.Value, txn);
        }

        //保存视图模型对应的所有程序集的映射
        foreach (var kv in viewAssemblyMap)
        {
            await MetaStore.Provider.UpsertAssemblyAsync(MetaAssemblyType.ViewAssemblies, kv.ViewModelName, kv.MapData,
                txn,
                kv.AssemblyFlag);
        }

        await txn.CommitAsync();

        // 清除临时目录
#if !DEBUG
        Directory.Delete(tempPath, true);
#endif
    }

    private readonly struct MapItem
    {
        public MapItem(string viewModelName, AssemblyFlag assemblyFlag, byte[] data)
        {
            ViewModelName = viewModelName;
            AssemblyFlag = assemblyFlag;
            MapData = data;
        }

        public readonly string ViewModelName;
        public readonly AssemblyFlag AssemblyFlag;
        public readonly byte[] MapData;
    }

    #endregion
}

internal sealed class PublishContainer : IModelContainer
{
    public PublishContainer(PublishPackage package)
    {
        Package = package;
    }

    internal readonly PublishPackage Package;
    // private readonly Dictionary<long, DataStoreModel> _stores = [];
    //
    // public DataStoreModel GetDataStoreModel(long storeId)
    // {
    //     if (_stores.TryGetValue(storeId, out var model))
    //         return model;
    //     
    //     MetaStore.Provider.
    // }

    public ApplicationModel GetApplicationModel(int appId) => RuntimeContext.GetApplication(appId);

    public EntityModel GetEntityModel(ModelId modelId)
    {
        var changed = Package.Models
            .Where(m => m.ModelType == ModelType.Entity && m.Id == modelId)
            .Cast<EntityModel>()
            .FirstOrDefault();
        if (changed != null)
            return changed;

        return (EntityModel)MetaStore.Provider.LoadModelAsync(modelId).Result;
    }
}