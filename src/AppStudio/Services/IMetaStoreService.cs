using AppBoxCore;

namespace AppBoxDesign;

public interface IMetaStoreService
{
    Task<IList<ApplicationModel>> LoadAllApplicationAsync();

    Task<IList<ModelFolder>> LoadAllFolderAsync();

    Task<IList<ModelBase>> LoadAllModelAsync();

    Task DownloadModelCodeAsync(Stream toStream, ModelId modelId);

    Task<ModelId> GenModelIdAsync(int appId, ModelType modelType, ModelLayer layer);
}