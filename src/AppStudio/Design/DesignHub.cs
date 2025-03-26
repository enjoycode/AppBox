using AppBoxCore;

namespace AppBoxDesign;

public sealed class DesignHub : IModelContainer, IDisposable
{
    static DesignHub()
    {
        //注册设计时序列化器
        DesignTypeSerializer.Register();
    }

    public static async ValueTask InitAsync(string sessionName, Guid leafOrgUnitId, ICheckoutService checkoutService,
        IStagedService stagedService, IMetaStoreService metaStoreService, IPublishService publishService)
    {
        //TODO: 判断是否已初始

        await MetadataReferences.InitAsync();

        Current = new DesignHub(sessionName, leafOrgUnitId,
            checkoutService, stagedService, metaStoreService, publishService);

        RuntimeContext.Init(new DesignTimeContext(), null);
    }

    private DesignHub(string sessionName, Guid leafOrgUnitId, ICheckoutService checkoutService,
        IStagedService stagedService, IMetaStoreService metaStoreService, IPublishService publishService)
    {
        SessionName = sessionName;
        LeafOrgUnitId = leafOrgUnitId;
        CheckoutService = checkoutService;
        StagedService = stagedService;
        MetaStoreService = metaStoreService;
        PublishService = publishService;

        TypeSystem = new TypeSystem(this);
        DesignTree = new DesignTree(this);
    }

    public static DesignHub Current { get; private set; } = null!;

    internal readonly string SessionName;
    internal readonly Guid LeafOrgUnitId;
    public readonly DesignTree DesignTree;
    internal readonly TypeSystem TypeSystem;
    internal readonly ICheckoutService CheckoutService;
    internal readonly IStagedService StagedService;
    internal readonly IMetaStoreService MetaStoreService;
    internal readonly IPublishService PublishService;

    /// <summary>
    /// 被标为删除的模型或其他,因获取服务端PendingChange无法解析已解删除的
    /// </summary>
    private readonly List<object> _removedItems = [];

    internal Func<int, string> AppNameGetter =>
        appId => DesignTree.FindApplicationNode(appId)!.Model.Name;

    internal Func<ModelId, ModelBase> ModelGetter =>
        id => DesignTree.FindModelNode(id)!.Model;

    public void Dispose()
    {
        TypeSystem.Dispose();
    }

    /// <summary>
    /// 根据服务端返回的变更项查找对应的目标
    /// </summary>
    public void ResolveChanges(IList<PendingChange> changes)
    {
        foreach (var change in changes)
        {
            switch (change.Type)
            {
                case StagedType.Model:
                {
                    var modelNode = DesignTree.FindModelNode(change.Id);
                    if (modelNode != null)
                    {
                        change.Target = modelNode.Model;
                        change.DisplayType = modelNode.Model.ModelType.ToString();
                        change.DisplayName = $"{modelNode.AppNode.Label.Value}.{modelNode.Model.Name}";
                    }
                    else //已被删除
                    {
                        var removedModel = (ModelBase)_removedItems
                            .Single(t => t is ModelBase m && m.Id == (ModelId)change.Id);
                        change.Target = removedModel;
                        change.DisplayType = removedModel.ModelType.ToString();
                        change.DisplayName = $"{AppNameGetter(removedModel.AppId)}.{removedModel.Name}";
                    }
                }

                    break;
                case StagedType.Folder:
                    var modelRootNode = (ModelRootNode)DesignTree.FindNode(DesignNodeType.ModelRootNode, change.Id)!;
                    change.Target = modelRootNode.RootFolder;
                    change.DisplayType = "Folder";
                    change.DisplayName = $"{modelRootNode.Parent!.Label.Value}.{modelRootNode.Label.Value}";
                    break;
                case StagedType.SourceCode:
                {
                    var modelNode = DesignTree.FindModelNode(change.Id);
                    if (modelNode != null)
                        change.Target = modelNode;
                }
                    break;
                default:
                    throw new NotImplementedException(change.Type.ToString());
            }
        }
    }

    public void AddRemovedItem(object item) => _removedItems.Add(item);

    public void ClearRemovedItems() => _removedItems.Clear();

    #region ====IModelContainer====

    public ApplicationModel GetApplicationModel(int appId)
        => DesignTree.FindApplicationNode(appId)!.Model;

    public EntityModel GetEntityModel(ModelId modelId)
        => (EntityModel)DesignTree.FindModelNode(modelId)!.Model;

    #endregion
}

internal sealed class DesignTimeContext : IRuntimeContext
{
    public IUserSession? CurrentSession { get; }

    public ValueTask<ApplicationModel> GetApplicationAsync(int appId)
    {
        throw new NotImplementedException();
    }

    public ValueTask<T> GetModelAsync<T>(ModelId modelId) where T : ModelBase
    {
        return new ValueTask<T>((T)DesignHub.Current.DesignTree.FindModelNode(modelId)!.Model);
    }

    public ValueTask<AnyValue> InvokeAsync(string service, InvokeArgs args)
    {
        throw new NotImplementedException();
    }

    public void InvalidModelsCache(string[]? services, ModelId[]? others, bool byPublish)
    {
        throw new NotImplementedException();
    }
}