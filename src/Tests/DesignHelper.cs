using AppBoxClient;
using AppBoxCore;
using AppBoxDesign;
using AppBoxStore;
using Microsoft.CodeAnalysis;

namespace Tests;

public static class DesignHelper
{
    internal static async Task<DesignHub> MockDesignHub()
    {
        LocalFileSystem.Init(new OSFileSystem());
        await MetadataReferences.InitAsync(new MockMetadataReferenceProvider());

        var mockSession = ServerRuntimeHelper.MockUserSession();
        var designContext = new DesignHub(mockSession.Name, mockSession.LeafOrgUnitId);
        designContext.InitServices(new MockDesignUIService(), new MockCheckoutService(),
            new MockStagedService(), new MockMetaStoreService(), new MockPublishService());
        designContext.TypeSystem.InitWorkspace();

        await designContext.DesignTree.LoadAsync();
        return designContext;
    }

    internal static async Task ReplaceCode(DesignHub hub, DocumentId documentId, string code)
    {
        var workspace = hub.TypeSystem.Workspace;
        var roslynDoc = workspace.CurrentSolution.GetDocument(documentId)!;
        var sourceText = await roslynDoc.GetTextAsync();
        sourceText = sourceText.Replace(0, sourceText.Length, code);
        workspace.OnDocumentChanged(documentId, sourceText);
    }
}

internal sealed class MockDesignUIService : IDesignUIService
{
    public Task LoadDesignTreeAsync() => throw new NotImplementedException();
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
    }

    public Task DownloadCodeAsync(Stream toStream, ModelId modelId) => throw new NotImplementedException();

    public Task SaveFolderAsync(ModelFolder folder) => throw new NotImplementedException();

    public Task SaveModelAsync(ModelBase model) => throw new NotImplementedException();

    public Task SaveCodeAsync(ModelId modelId, Stream code) => throw new NotImplementedException();

    public Task DeleteModelAsync(ModelId modelId) => throw new NotImplementedException();
}

internal sealed class MockMetaStoreService : IMetaStoreService
{
    public async Task<IList<ApplicationModel>> LoadAllApplicationAsync()
    {
        await using var stream = await MetaStore.DownloadApplicationsAsync();
        stream.Position = 0;
        return MetaSerializer.DeserializeApplications(stream);
    }

    public async Task<IList<ModelFolder>> LoadAllFolderAsync()
    {
        await using var stream = await MetaStore.DownloadFoldersAsync();
        stream.Position = 0;
        return MetaSerializer.DeserializeFolders(stream);
    }

    public async Task<IList<ModelBase>> LoadAllModelAsync()
    {
        await using var stream = await MetaStore.DownloadModelsAsync();
        stream.Position = 0;
        return MetaSerializer.DeserializeModels(stream);
    }

    public async Task DownloadModelCodeAsync(Stream toStream, ModelId modelId)
    {
        await using var stream = await MetaStore.Provider.DownloadModelCodeAsync(modelId);
        stream.Position = 0;
        await stream.CopyToAsync(toStream);
    }

    public Task<ModelId> GenModelIdAsync(int appId, ModelType modelType, ModelLayer layer) =>
        MetaStore.Provider.GenModelIdAsync(appId, modelType, layer);
}

internal sealed class MockPublishService : IPublishService
{
    public Task PublishAsync(PublishPackage package, string commitMessage) =>
        AppBoxServer.Design.PublishService.PublishAsync(package, commitMessage);

    public Task UploadServiceAssembly(Stream stream, string assemblyName, bool isFirst) =>
        throw new NotImplementedException();

    public Task UploadAppAssembly(Stream stream, string assemblyName, bool isFirst) =>
        throw new NotImplementedException();

    public Task UploadViewAssemblyMap(Stream stream) => throw new NotImplementedException();
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