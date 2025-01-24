using AppBoxCore;

namespace AppBoxDesign;

public interface IMetaStoreService
{
    Task<ApplicationModel[]> LoadAllApplicationAsync();
    
    Task<ModelFolder[]> LoadAllFolderAsync();

    Task<ModelBase[]> LoadAllModelAsync();
    
    Task<string?> LoadModelCodeAsync(ModelId modelId);
    
    Task<ModelId> GenModelIdAsync(int appId, ModelType modelType, ModelLayer layer);
}