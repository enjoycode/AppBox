using System;
using System.Data.Common;
using System.Threading.Tasks;
using AppBoxCore;

namespace AppBoxStore;

public interface IMetaStore
{
    Task CreateApplicationAsync(ApplicationModel app, DbTransaction txn);

    Task<ModelId> GenModelIdAsync(int appId, ModelType type, ModelLayer layer);

    Task UpsertFolderAsync(ModelFolder folder, DbTransaction txn);

    Task DeleteFolderAsync(ModelFolder folder, DbTransaction txn);

    Task InsertModelAsync(ModelBase model, DbTransaction txn);

    Task UpdateModelAsync(ModelBase model, DbTransaction txn, Func<int, ApplicationModel> getApp);

    Task DeleteModelAsync(ModelBase model, DbTransaction txn, Func<int, ApplicationModel> getApp);

    Task UpsertModelCodeAsync(ModelId modelId, byte[] codeData, DbTransaction txn);

    Task DeleteModelCodeAsync(ModelId modelId, DbTransaction txn);

    Task UpsertAssemblyAsync(MetaAssemblyType type, string asmName, byte[] asmData,
        DbTransaction txn, AssemblyPlatform platform = AssemblyPlatform.Common);

    Task DeleteAssemblyAsync(MetaAssemblyType type, string asmName, DbTransaction txn);

    /// <summary>
    /// 用于设计时加载所有ApplicationModel
    /// </summary>
    Task<ApplicationModel[]> LoadAllApplicationAsync();

    /// <summary>
    /// 用于设计时加载所有Folder
    /// </summary>
    Task<ModelFolder[]> LoadAllFolderAsync();

    /// <summary>
    /// 用于设计时加载所有Model
    /// </summary>
    Task<ModelBase[]> LoadAllModelAsync();

    /// <summary>
    ///  加载单个Model，用于运行时或设计时重新加载
    /// </summary>
    Task<ModelBase> LoadModelAsync(ModelId modelId);

    /// <summary>
    /// 加载模型(视图、服务等)的代码
    /// </summary>
    Task<string> LoadModelCodeAsync(ModelId modelId);

    Task<byte[]?> LoadServiceAssemblyAsync(string serviceName);
}