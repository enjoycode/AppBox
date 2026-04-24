using AppBoxCore;

namespace AppBoxDesign;

public interface IMetaStoreService
{
    Task<IList<ApplicationModel>> LoadAllApplicationAsync();

    Task<IList<ModelFolder>> LoadAllFolderAsync();

    Task<IList<ModelBase>> LoadAllModelAsync();

    Task DownloadModelCodeAsync(Stream toStream, ModelId modelId);

    Task<ModelId> GenModelIdAsync(int appId, ModelType modelType, ModelLayer layer);
    
    /// <summary>
    /// 仅用于导出应用包时获取模型标识计数器
    /// </summary>
    Task<byte[]?> LoadModelIdCounterAsync(int appId, bool forDev);
    
    /// <summary>
    /// 仅用于导入应用包时更新模型标识计数器
    /// </summary>
    Task UpsertModelIdCounterAsync(int appId, bool forDev, byte[] counterData);

    Task CreateApplicationAsync(ApplicationModel app);

    Task DeleteApplicationAsync(ApplicationModel app);

    Task<byte> UploadExtLib(Stream input, string appName, string fileName);
}