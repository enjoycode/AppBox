using System.Data.Common;
using AppBoxCore;
using static AppBoxStore.StoreLogger;

#if !FUTURE

namespace AppBoxStore;

/// <summary>
/// 模型存储相关Api
/// </summary>
public sealed class SqlMetaStore : IMetaStore
{
    #region ====模型相关操作====

    public async Task CreateApplicationAsync(ApplicationModel app)
    {
        await using var conn = await SqlStore.Default.OpenConnectionAsync();
        await using var txn = await conn.BeginTransactionAsync();
        await CreateApplicationAsync(app, txn);
        await txn.CommitAsync();
    }

    public async Task CreateApplicationAsync(ApplicationModel app, DbTransaction txn)
    {
        await using var cmd = SqlStore.Default.MakeCommand();
        cmd.Connection = txn.Connection;
        cmd.Transaction = txn;
        BuildInsertMetaCommand(cmd, MetaType.META_APPLICATION, app.Id.ToString(),
            MetaType.MODEL_TYPE_APPLICATION, MetaSerializer.SerializeMeta(app), false);
        await cmd.ExecuteNonQueryAsync();
    }

    internal static async ValueTask DeleteApplicationAsync(ApplicationModel app)
    {
        await using var conn = await SqlStore.Default.OpenConnectionAsync();
        await using var cmd = SqlStore.Default.MakeCommand();
        cmd.Connection = conn;
        BuildDeleteMetaCommand(cmd, MetaType.META_APPLICATION, app.Id.ToString());
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task<ModelId> GenModelIdAsync(int appId, ModelType type, ModelLayer layer)
    {
        if (layer == ModelLayer.SYS) //不允许SYS Layer
            throw new ArgumentException(nameof(layer));
        var meta = layer == ModelLayer.DEV
            ? MetaType.META_APP_MODEL_DEV_COUNTER
            : MetaType.META_APP_MODEL_USR_COUNTER;
        var id = appId.ToString();

        var db = SqlStore.Default;
        var esc = db.NameEscaper;
        await using var conn = db.MakeConnection();
        await conn.OpenAsync();
        await using var txn = await conn.BeginTransactionAsync(); //不支持select for update的事务隔离级别

        await using var cmd1 = db.MakeCommand();
        cmd1.Connection = txn.Connection;
        cmd1.Transaction = txn;
        cmd1.CommandText = $"Select data From {esc}sys.Meta{esc} Where meta={meta} And id='{id}' For Update";
        await using var reader = await cmd1.ExecuteReaderAsync();
        byte[] counterData;
        int seq;

        await using var cmd2 = db.MakeCommand();
        if (await reader.ReadAsync()) //已存在计数器
        {
            counterData = (byte[])reader.GetValue(0);
            seq = BitConverter.ToInt32(counterData) + 1; //TODO:判断溢出
            counterData = BitConverter.GetBytes(seq);

            BuildUpdateMetaCommand(cmd2, meta, id, counterData);
        }
        else //不存在计数器
        {
            seq = 1;
            counterData = BitConverter.GetBytes(seq);
            BuildInsertMetaCommand(cmd2, meta, id, MetaType.MODEL_TYPE_APPLICATION, counterData, false);
        }

        await reader.CloseAsync();

        cmd2.Connection = txn.Connection;
        cmd2.Transaction = txn;
        await cmd2.ExecuteNonQueryAsync();

        await txn.CommitAsync();

        return ModelId.Make(appId, type, seq, layer);
    }

    public async Task InsertModelAsync(ModelBase model, DbTransaction txn)
    {
        await using var cmd = SqlStore.Default.MakeCommand();
        cmd.Connection = txn.Connection;
        cmd.Transaction = txn;
        BuildInsertMetaCommand(cmd, MetaType.META_MODEL, model.Id.ToString(), (byte)model.ModelType,
            MetaSerializer.SerializeMeta(model), false);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task UpdateModelAsync(ModelBase model, DbTransaction txn,
        Func<int, ApplicationModel> getApp)
    {
        model.IncreaseVersion(); //注意增加模型版本号

        await using var cmd = SqlStore.Default.MakeCommand();
        cmd.Connection = txn.Connection;
        cmd.Transaction = txn;
        BuildUpdateMetaCommand(cmd, MetaType.META_MODEL, model.Id.ToString(), MetaSerializer.SerializeMeta(model));
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task DeleteModelAsync(ModelBase model, DbTransaction txn,
        Func<int, ApplicationModel> getApp)
    {
        await using var cmd = SqlStore.Default.MakeCommand();
        cmd.Connection = txn.Connection;
        cmd.Transaction = txn;
        BuildDeleteMetaCommand(cmd, MetaType.META_MODEL, model.Id.ToString());
        await cmd.ExecuteNonQueryAsync();
    }

    /// <summary>
    /// 插入或更新根文件夹
    /// </summary>
    public async Task UpsertFolderAsync(ModelFolder folder, DbTransaction txn)
    {
        if (folder.Parent != null)
            throw new InvalidOperationException("Can't save none root folder.");

        //TODO:暂先删除再插入
        var id =
            $"{folder.AppId.ToString()}.{(byte)folder.TargetModelType}"; //RootFolder.Id=Guid.Empty
        await using var cmd = SqlStore.Default.MakeCommand();
        cmd.Connection = txn.Connection;
        cmd.Transaction = txn;
        BuildDeleteMetaCommand(cmd, MetaType.META_FOLDER, id);
        BuildInsertMetaCommand(cmd, MetaType.META_FOLDER, id, MetaType.MODEL_TYPE_FOLDER,
            MetaSerializer.SerializeMeta(folder),
            true);
        await cmd.ExecuteNonQueryAsync();
    }

    /// <summary>
    /// 删除根文件夹
    /// </summary>
    public async Task DeleteFolderAsync(ModelFolder folder, DbTransaction txn)
    {
        if (folder.Parent != null)
            throw new InvalidOperationException("Can't delete none root folder.");
        var id =
            $"{folder.AppId.ToString()}.{(byte)folder.TargetModelType}"; //RootFolder.Id=Guid.Empty
        await using var cmd = SqlStore.Default.MakeCommand();
        cmd.Connection = txn.Connection;
        cmd.Transaction = txn;
        BuildDeleteMetaCommand(cmd, MetaType.META_FOLDER, id);
        await cmd.ExecuteNonQueryAsync();
    }

    #endregion

    #region ====模型代码及Assembly相关操作====

    /// <summary>
    /// Insert or Update模型相关的代码，目前主要用于服务模型及视图模型
    /// </summary>
    /// <param name="modelId"></param>
    /// <param name="codeData">已经压缩编码过</param>
    /// <param name="txn"></param>
    public async Task UpsertModelCodeAsync(ModelId modelId, byte[] codeData, DbTransaction txn)
    {
        //TODO:暂先删除再插入
        var id = modelId.ToString();
        await using var cmd = SqlStore.Default.MakeCommand();
        cmd.Connection = txn.Connection;
        cmd.Transaction = txn;
        BuildDeleteMetaCommand(cmd, MetaType.META_CODE, id);
        BuildInsertMetaCommand(cmd, MetaType.META_CODE, id, (byte)modelId.Type, codeData, true);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task DeleteModelCodeAsync(ModelId modelId, DbTransaction txn)
    {
        await using var cmd = SqlStore.Default.MakeCommand();
        cmd.Connection = txn.Connection;
        cmd.Transaction = txn;
        BuildDeleteMetaCommand(cmd, MetaType.META_CODE, modelId.ToString());
        await cmd.ExecuteNonQueryAsync();
    }

    // /// <summary>
    // /// 加载指定应用的第三方组件列表，仅用于设计时前端绑定
    // /// </summary>
    // internal static async ValueTask<IList<string>> LoadAppAssemblies(string appName)
    // {
    //     byte meta = (byte)MetaAssemblyType.Application;
    //     byte model = (byte)AssemblyPlatform.Common;
    //
    //     var db = SqlStore.Default;
    //     var esc = db.NameEscaper;
    //     using var conn = await db.OpenConnectionAsync();
    //     using var cmd = db.MakeCommand();
    //     cmd.Connection = conn;
    //     cmd.CommandText =
    //         $"Select id From {esc}sys.Meta{esc} Where meta={meta} And id Like '{appName}.%' And model={model}";
    //     Log.Debug(cmd.CommandText);
    //     using var reader = await cmd.ExecuteReaderAsync();
    //     var list = new List<string>();
    //     while (await reader.ReadAsync())
    //     {
    //         var id = reader.GetString(0);
    //         var firstDot = id.AsSpan().IndexOf('.');
    //         var lastDot = id.AsSpan().LastIndexOf('.');
    //         list.Add(id.AsSpan(firstDot + 1, lastDot - firstDot - 1).ToString());
    //     }
    //
    //     return list;
    // }

    /// <summary>
    /// 保存编译好的服务组件或视图运行时代码或外部程序集
    /// </summary>
    /// <param name="type"></param>
    /// <param name="asmName">
    /// 1. 外部程序集名称: eg: "sys.Newtonsoft.Json.dll", 包含app前缀防止冲突
    /// 2. 服务或视图模型为名称: eg: "sys.HelloService" or "sys.HomePage"
    /// </param>
    /// <param name="asmData">已压缩</param>
    /// <param name="txn"></param>
    /// <param name="flag"></param>
    public async Task UpsertAssemblyAsync(MetaAssemblyType type, string asmName, byte[] asmData,
        DbTransaction? txn, AssemblyPlatform flag = AssemblyPlatform.None)
    {
        await using var cmd = SqlStore.Default.MakeCommand();
        DbConnection? conn = null;
        if (txn == null)
        {
            conn = SqlStore.Default.MakeConnection();
            await conn.OpenAsync();
            cmd.Connection = conn;
        }
        else
        {
            cmd.Connection = txn.Connection;
            cmd.Transaction = txn;
        }

        BuildDeleteMetaCommand(cmd, (byte)type, asmName);
        BuildInsertMetaCommand(cmd, (byte)type, asmName, (byte)flag, asmData, true);
        await cmd.ExecuteNonQueryAsync();

        if (conn != null) await conn.CloseAsync();
    }

    public async Task DeleteAssemblyAsync(MetaAssemblyType type, string asmName, DbTransaction txn)
    {
        await using var cmd = SqlStore.Default.MakeCommand();
        cmd.Connection = txn.Connection;
        cmd.Transaction = txn;
        BuildDeleteMetaCommand(cmd, (byte)type, asmName);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task DeleteAllAppAssembliesAsync(DbTransaction txn)
    {
        await using var cmd = SqlStore.Default.MakeCommand();
        cmd.Connection = txn.Connection;
        cmd.Transaction = txn;
        var esc = SqlStore.Default.NameEscaper;
        cmd.CommandText =
            $"Delete From {esc}sys.Meta{esc} Where meta={(byte)MetaAssemblyType.ClientApp} Or meta={(byte)MetaAssemblyType.ViewAssemblies}";
        await cmd.ExecuteNonQueryAsync();
    }

    #endregion

    #region ====视图模型路由相关====

    /// <summary>
    /// 保存视图模型路由表
    /// </summary>
    /// <param name="viewName">eg: sys.CustomerList</param>
    /// <param name="path">无自定义路由为空, 有上级则;分隔</param>
    /// <param name="txn"></param>
    internal static async ValueTask UpsertViewRoute(string viewName, string path, DbTransaction txn)
    {
        await using var cmd = SqlStore.Default.MakeCommand();
        cmd.Connection = txn.Connection;
        cmd.Transaction = txn;
        BuildDeleteMetaCommand(cmd, MetaType.META_VIEW_ROUTER, viewName);
        BuildInsertMetaCommand(cmd, MetaType.META_VIEW_ROUTER, viewName, (byte)ModelType.View,
            System.Text.Encoding.UTF8.GetBytes(path), true);
        await cmd.ExecuteNonQueryAsync();
    }

    internal static async ValueTask DeleteViewRoute(string viewName, DbTransaction txn)
    {
        using var cmd = SqlStore.Default.MakeCommand();
        cmd.Connection = txn.Connection;
        cmd.Transaction = txn;
        BuildDeleteMetaCommand(cmd, MetaType.META_VIEW_ROUTER, viewName);
        await cmd.ExecuteNonQueryAsync();
    }

    internal static async ValueTask<ValueTuple<string, string>[]> LoadViewRoutes()
    {
        var db = SqlStore.Default;
        var esc = db.NameEscaper;
        using var conn = await db.OpenConnectionAsync();
        using var cmd = db.MakeCommand();
        cmd.Connection = conn;
        cmd.CommandText = $"Select id,data From {esc}sys.Meta{esc} Where meta={MetaType.META_VIEW_ROUTER}";
        Logger.Debug(cmd.CommandText);
        using var reader = await cmd.ExecuteReaderAsync();
        var list = new List<ValueTuple<string, string>>();
        while (await reader.ReadAsync())
        {
            var key = reader.GetString(0);
            var valueData = (byte[])reader.GetValue(1);
            var res = ValueTuple.Create(key, System.Text.Encoding.UTF8.GetString(valueData));
            list.Add(res);
        }

        return list.ToArray();
    }

    #endregion

    #region ====导出相关====

    // /// <summary>
    // /// 加载指定App的所有模型包，用于导出
    // /// </summary>
    // /// <param name="appName">eg: erp</param>
    // internal static async Task LoadToAppPackage(uint appId, string appName, Server.IAppPackage pkg)
    // {
    //     var db = SqlStore.Default;
    //     var esc = db.NameEscaper;
    //     var appPrefix = $"{appName}.";
    //     using var conn = await db.OpenConnectionAsync();
    //     using var cmd = db.MakeCommand();
    //     cmd.Connection = conn;
    //     cmd.CommandText =
    //         $"Select meta,id,data From {esc}sys.Meta{esc} Where meta<{Meta_View_Router} And model<>10";
    //     using var reader = await cmd.ExecuteReaderAsync();
    //
    //     while (await reader.ReadAsync())
    //     {
    //         // 根据不同类型判断是否属于当前App
    //         var metaType = reader.GetInt16(0);
    //         var id = reader.GetString(1);
    //         switch (metaType)
    //         {
    //             case Meta_Application:
    //             {
    //                 if (uint.Parse(id) == appId)
    //                 {
    //                     var appModel =
    //                         (ApplicationModel)DeserializeModel(
    //                             (byte[])reader.GetValue(2)); //TODO: use GetStream
    //                     pkg.Application = appModel;
    //                 }
    //             }
    //                 break;
    //             case Meta_Model:
    //             {
    //                 ulong modelId = ulong.Parse(id);
    //                 if (IdUtil.GetAppIdFromModelId(modelId) == appId)
    //                 {
    //                     var model =
    //                         (ModelBase)DeserializeModel((byte[])reader.GetValue(2)); //TODO:同上
    //                     model.AcceptChanges();
    //                     pkg.Models.Add(model);
    //                 }
    //             }
    //                 break;
    //             case Meta_Code:
    //             {
    //                 ulong modelId = ulong.Parse(id);
    //                 if (IdUtil.GetAppIdFromModelId(modelId) == appId)
    //                     pkg.SourceCodes.Add(modelId, (byte[])reader.GetValue(2));
    //             }
    //                 break;
    //             case Meta_Folder:
    //             {
    //                 var dotIndex = id.AsSpan().IndexOf('.');
    //                 uint folderAppId = uint.Parse(id.AsSpan(0, dotIndex));
    //                 if (folderAppId == appId)
    //                 {
    //                     var folder =
    //                         (ModelFolder)DeserializeModel((byte[])reader.GetValue(2)); //TODO:同上
    //                     pkg.Folders.Add(folder);
    //                 }
    //             }
    //                 break;
    //             case Meta_Service_Assembly:
    //             {
    //                 if (id.AsSpan().StartsWith(appPrefix))
    //                     pkg.ServiceAssemblies.Add(id, (byte[])reader.GetValue(2));
    //             }
    //                 break;
    //             case Meta_View_Assembly:
    //             {
    //                 if (id.AsSpan().StartsWith(appPrefix))
    //                     pkg.ViewAssemblies.Add(id, (byte[])reader.GetValue(2));
    //             }
    //                 break;
    //             default:
    //                 Log.Warn($"Load unknown meta type: {metaType}");
    //                 break;
    //         }
    //     }
    // }

    #endregion

    #region ====LoadMeta====

    public async Task<byte[]?> LoadMetaDataAsync(byte metaType, string id)
    {
        var db = SqlStore.Default;
        var esc = db.NameEscaper;
        await using var conn = await db.OpenConnectionAsync();
        await using var cmd = db.MakeCommand();
        cmd.Connection = conn;
        cmd.CommandText = $"Select data From {esc}sys.Meta{esc} Where meta={metaType} And id='{id}'";
        Logger.Debug(cmd.CommandText);
        await using var reader = await cmd.ExecuteReaderAsync();
        byte[]? metaData = null;
        if (await reader.ReadAsync())
        {
            metaData = (byte[])reader.GetValue(0); //TODO:Use GetStream
        }

        return metaData;
    }

    /// <summary>
    /// 加载所有指定meta类型并反序列化目标类型
    /// </summary>
    public async Task<T[]> LoadMetasAsync<T>(byte metaType) where T : IBinSerializable
    {
        var db = SqlStore.Default;
        var esc = db.NameEscaper;
        await using var conn = await db.OpenConnectionAsync();
        await using var cmd = db.MakeCommand();
        cmd.Connection = conn;
        cmd.CommandText = $"Select data,id From {esc}sys.Meta{esc} Where meta={metaType}";
        Logger.Debug(cmd.CommandText);
        await using var reader = await cmd.ExecuteReaderAsync();
        var list = new List<T>();
        while (await reader.ReadAsync())
        {
            var data = (byte[])reader.GetValue(0);
            switch (metaType)
            {
                case MetaType.META_APPLICATION:
                {
                    var appModel = MetaSerializer.DeserializeMeta<IBinSerializable>(data,
                        () => new ApplicationModel());
                    list.Add((T)appModel);
                    break;
                }
                case MetaType.META_FOLDER:
                {
                    var folder = MetaSerializer.DeserializeMeta<IBinSerializable>(data,
                        () => new ModelFolder());
                    list.Add((T)folder);
                    break;
                }
                case MetaType.META_MODEL:
                {
                    ModelId modelId = reader.GetString(1);
                    var model = MetaSerializer.DeserializeMeta<IBinSerializable>(data,
                        () => ModelFactory.Make(modelId.Type));
                    list.Add((T)model);
                    break;
                }
                default: throw new NotImplementedException();
            }
        }

        return list.ToArray();
    }

    public async Task<string[]> LoadMetaNamesAsync(byte metaType, byte? model)
    {
        var db = SqlStore.Default;
        var esc = db.NameEscaper;
        await using var conn = await db.OpenConnectionAsync();
        await using var cmd = db.MakeCommand();
        cmd.Connection = conn;
        cmd.CommandText = $"Select id From {esc}sys.Meta{esc} Where meta={metaType}";
        if (model.HasValue)
            cmd.CommandText += $" And model={model.Value}";
        Logger.Debug(cmd.CommandText);
        await using var reader = await cmd.ExecuteReaderAsync();
        var list = new List<string>();
        while (await reader.ReadAsync())
        {
            list.Add(reader.GetString(0));
        }

        return list.ToArray();
    }

    #endregion

    #region ====Insert/Update/Delete====

    private static void BuildInsertMetaCommand(DbCommand cmd, byte metaType, string id,
        byte modelType, byte[] data, bool append)
    {
        var db = SqlStore.Default;
        var esc = db.NameEscaper;
        var pname = db.ParameterPrefix;
        var cmdTxt =
            $"Insert Into {esc}sys.Meta{esc} (meta,id,model,data) Values ({metaType},'{id}',{modelType}, {pname}v)";
        if (append)
            cmd.CommandText += ";" + cmdTxt + ";";
        else
            cmd.CommandText = cmdTxt;

        var vp = cmd.CreateParameter();
        vp.ParameterName = $"{pname}v";
        vp.DbType = System.Data.DbType.Binary;
        vp.Value = data;
        cmd.Parameters.Add(vp);
    }

    private static void BuildUpdateMetaCommand(DbCommand cmd, byte metaType, string id, byte[] data)
    {
        var db = SqlStore.Default;
        var esc = db.NameEscaper;
        var pf = db.ParameterPrefix;
        cmd.CommandText =
            $"Update {esc}sys.Meta{esc} Set data={pf}v Where meta={metaType} And id='{id}'";

        var vp = cmd.CreateParameter();
        vp.ParameterName = $"{pf}v";
        vp.DbType = System.Data.DbType.Binary;
        vp.Value = data;
        cmd.Parameters.Add(vp);
    }

    private static void BuildDeleteMetaCommand(DbCommand cmd, byte metaType, string id)
    {
        var db = SqlStore.Default;
        var esc = db.NameEscaper;
        cmd.CommandText = $"Delete From {esc}sys.Meta{esc} Where meta={metaType} And id='{id}'";
    }

    #endregion
}

#endif