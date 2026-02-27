using AppBoxCore;
using AppBoxDesign;
using AppBoxStore;
using Microsoft.CodeAnalysis;

namespace Tests;

public static class DesignHelper
{
    internal static async Task<DesignHub> MockDesignHub()
    {
        var mockSession = ServerRuntimeHelper.MockUserSession();
        await DesignHub.InitAsync(
            mockSession.Name, mockSession.LeafOrgUnitId,
            new MockCheckoutService(), new MockStagedService(), new MockMetaStoreService(), new MockPublishService(),
            new MockMetadataReferenceProvider()
        );

        var hub = DesignHub.Current;
        await hub.DesignTree.LoadAsync();
        return hub;
    }
}

internal sealed class MockCheckoutService : ICheckoutService
{
    public Task<Dictionary<string, CheckoutInfo>> LoadAllAsync()
    {
        return Task.FromResult(new Dictionary<string, CheckoutInfo>());

        //TODO:
        // var list = await AppBoxServer.Design.CheckoutService.LoadAllAsync();
        // if (list.Count == 0)
        //     return [];
        //
        // var dic = new Dictionary<string, CheckoutInfo>();
        // foreach (var item in list)
        // {
        //     var info = new CheckoutInfo((DesignNodeType)item.NodeType, item.TargetId,
        //         item.Version, item.DeveloperName, item.DeveloperId);
        //     dic.Add(info.GetKey(), info);
        // }
        //
        // return dic;
    }

    public Task<CheckoutResult> CheckoutAsync(IList<CheckoutInfo> info)
    {
        throw new NotImplementedException();
    }
}

internal sealed class MockStagedService : IStagedService
{
    public Task<StagedItems> LoadStagedAsync()
    {
        return Task.FromResult(new StagedItems([]));
        //TODO:
        // var list = await AppBoxServer.Design.StagedService.LoadStagedAsync();
        // return new StagedItems(list);
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

    public Task BeginUploadApp()
    {
        throw new NotImplementedException();
    }

    public Task UploadAppAssembly(Action<IOutputStream> writer)
    {
        throw new NotImplementedException();
    }

    public Task UploadViewAssemblyMap(Action<IOutputStream> writer)
    {
        throw new NotImplementedException();
    }
}

internal sealed class MockMetadataReferenceProvider : IMetadataReferenceProvider
{
    private readonly string _sdkPath = Path.GetDirectoryName(typeof(object).Assembly.Location)!;
    private readonly string _appPath = Path.GetDirectoryName(typeof(TypeSystem).Assembly.Location)!;

    public ValueTask<MetadataReference> LoadSdkLib(string assemblyName)
    {
        var fullPath = Path.Combine(_sdkPath, assemblyName);
        return new ValueTask<MetadataReference>(MetadataReference.CreateFromFile(fullPath));
    }

    public ValueTask<MetadataReference> LoadCommonLib(string assemblyName)
    {
        var fullPath = Path.Combine(_appPath, assemblyName);
        return new ValueTask<MetadataReference>(MetadataReference.CreateFromFile(fullPath));
    }

    public ValueTask<MetadataReference> LoadClientLib(string assemblyName)
    {
        var fullPath = Path.Combine(_appPath, assemblyName);
        return new ValueTask<MetadataReference>(MetadataReference.CreateFromFile(fullPath));
    }

    public ValueTask<MetadataReference> LoadServerLib(string assemblyName)
    {
        var fullPath = Path.Combine(_appPath, assemblyName);
        return new ValueTask<MetadataReference>(MetadataReference.CreateFromFile(fullPath));
    }

    public ValueTask<MetadataReference> LoadServerExtLib(string appName, string assemblyName) =>
        throw new NotImplementedException($"{nameof(MockMetadataReferenceProvider)}.{nameof(LoadServerExtLib)}");
}