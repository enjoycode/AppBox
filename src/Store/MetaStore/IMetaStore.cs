using System.Data.Common;
using System.Threading.Tasks;
using AppBoxCore;

namespace AppBoxStore;

public interface IMetaStore
{
    Task TryInitStoreAsync();

    Task CreateApplicationAsync(ApplicationModel app, DbTransaction txn);

    Task<ModelId> GenModelIdAsync(int appId, ModelType type, ModelLayer layer);

    Task UpsertFolderAsync(ModelFolder folder, DbTransaction txn);

    Task InsertModelAsync(ModelBase model, DbTransaction txn);

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
    public Task<string> LoadModelCodeAsync(ModelId modelId);
}