using AppBoxCore;
using AppBoxDesign;
using AppBoxStore;

namespace Tests;

public static class DesignHelper
{
    internal static async Task<DesignHub> MockDesignHub()
    {
        var mockSession = ServerRuntimeHelper.MockUserSession();
        var designHub = new DesignHub(mockSession.Name, mockSession.LeafOrgUnitId,
            new MockCheckoutService(), new MockStagedService(), new MockMetaStoreService(), new MockPublishService());
        DesignHub.Current = designHub;
        await designHub.DesignTree.LoadAsync();
        return designHub;
    }
}

internal sealed class MockCheckoutService : ICheckoutService
{
    public async Task<Dictionary<string, CheckoutInfo>> LoadAllAsync()
    {
        var list = await AppBoxServer.Design.CheckoutService.LoadAllAsync();
        if (list.Count == 0)
            return [];

        var dic = new Dictionary<string, CheckoutInfo>();
        foreach (var item in list)
        {
            var info = new CheckoutInfo((DesignNodeType)item.NodeType, item.TargetId,
                item.Version, item.DeveloperName, item.DeveloperId);
            dic.Add(info.GetKey(), info);
        }

        return dic;
    }

    public Task<CheckoutResult> CheckoutAsync(IList<CheckoutInfo> info)
    {
        throw new NotImplementedException();
    }
}

internal sealed class MockStagedService : IStagedService
{
    public async Task<StagedItems> LoadStagedAsync()
    {
        var list = await AppBoxServer.Design.StagedService.LoadStagedAsync();
        return new StagedItems(list);
    }

    public Task<IList<PendingChange>> LoadChangesAsync()
    {
        throw new NotImplementedException();
    }

    public Task<string?> LoadCodeAsync(ModelId modelId)
    {
        throw new NotImplementedException();
    }

    public Task SaveFolderAsync(ModelFolder folder)
    {
        throw new NotImplementedException();
    }

    public Task SaveModelAsync(ModelBase model)
    {
        throw new NotImplementedException();
    }

    public Task SaveCodeAsync(ModelId modelId, string sourceCode)
    {
        throw new NotImplementedException();
    }

    public Task DeleteModelAsync(ModelId modelId)
    {
        throw new NotImplementedException();
    }
}

internal sealed class MockMetaStoreService : IMetaStoreService
{
    public Task<ApplicationModel[]> LoadAllApplicationAsync() => MetaStore.Provider.LoadAllApplicationAsync();

    public Task<ModelFolder[]> LoadAllFolderAsync() => MetaStore.Provider.LoadAllFolderAsync();

    public Task<ModelBase[]> LoadAllModelAsync() => MetaStore.Provider.LoadAllModelAsync();

    public Task<string?> LoadModelCodeAsync(ModelId modelId) => MetaStore.Provider.LoadModelCodeAsync(modelId);

    public Task<ModelId> GenModelIdAsync(int appId, ModelType modelType, ModelLayer layer) =>
        MetaStore.Provider.GenModelIdAsync(appId, modelType, layer);
}

internal sealed class MockPublishService : IPublishService
{
    public Task PublishAsync(PublishPackage package, string commitMessage) =>
        AppBoxServer.Design.PublishService.PublishAsync(package, commitMessage);
}