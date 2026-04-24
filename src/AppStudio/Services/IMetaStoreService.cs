using AppBoxCore;

namespace AppBoxDesign;

public interface IMetaStoreService
{
    Task<IList<ApplicationModel>> LoadAllApplicationAsync();

    Task<IList<ModelFolder>> LoadAllFolderAsync();

    Task<IList<ModelBase>> LoadAllModelAsync();

    Task DownloadModelCodeAsync(Stream toStream, ModelId modelId);

    Task<ModelId> GenModelIdAsync(int appId, ModelType modelType, ModelLayer layer);
    
    Task<byte[]?> LoadModelIdCounterAsync(int appId, bool forDev);

    Task CreateApplicationAsync(ApplicationModel app);

    Task DeleteApplicationAsync(ApplicationModel app);

    Task<byte> UploadExtLib(Stream input, string appName, string fileName);
}