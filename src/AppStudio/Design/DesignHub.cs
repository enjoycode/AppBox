using AppBoxClient;
using AppBoxCore;

namespace AppBoxDesign;

public sealed class DesignHub : IModelContainer, IDisposable
{
    static DesignHub()
    {
        //注册设计时序列化器
        DesignTypeSerializer.Register();
    }

    public DesignHub(string sessionName, Guid leafOrgUnitId)
    {
        SessionName = sessionName;
        LeafOrgUnitId = leafOrgUnitId;
        
        TypeSystem = new TypeSystem(this);
        DesignTree = new DesignTree(this);

        RuntimeContext.Init(new DesignTimeContext(this), null); //TODO: fix
    }

    internal readonly string SessionName;
    internal readonly Guid LeafOrgUnitId;
    public readonly DesignTree DesignTree;
    internal readonly TypeSystem TypeSystem;
    internal ICheckoutService CheckoutService { get; private set; }
    internal IStagedService StagedService { get; private set; }
    internal IMetaStoreService MetaStoreService { get; private set; }
    internal IPublishService PublishService { get; private set; }
    internal IDesignUIService DesignUIService { get; private set; }

    /// <summary>
    /// 被标为删除的模型或其他,因获取服务端PendingChange无法解析已经删除的
    /// </summary>
    private readonly List<object> _removedItems = [];

    internal Func<int, string> AppNameGetter => appId => DesignTree.FindApplicationNode(appId)!.Model.Name;

    //internal Func<ModelId, ModelBase> ModelGetter => id => DesignTree.FindModelNode(id)!.Model;

    public void InitServices(IDesignUIService uiService, ICheckoutService checkoutService,
        IStagedService stagedService, IMetaStoreService metaStoreService, IPublishService publishService)
    {
        DesignUIService = uiService;
        CheckoutService = checkoutService;
        StagedService = stagedService;
        MetaStoreService = metaStoreService;
        PublishService = publishService;
    }

    public void Dispose()
    {
        TypeSystem.Dispose();
    }

    /// <summary>
    /// 根据签出信息及删除信息获取变更项
    /// </summary>
    internal List<PendingChange> GetChanges()
    {
        var changes = new List<PendingChange>();

        var checkouts = DesignTree.GetAllCheckoutByMe();
        foreach (var checkout in checkouts)
        {
            switch (checkout.NodeType)
            {
                case DesignNodeType.ModelNode:
                {
                    var modelNode = DesignTree.FindModelNode(checkout.TargetId);
                    if (modelNode != null)
                    {
                        var change = new PendingChange();
                        change.Target = modelNode.Model;
                        change.DesignNode = modelNode;
                        change.DisplayType = modelNode.Model.ModelType.ToString();
                        change.DisplayName = $"{modelNode.AppNode.Label.Value}.{modelNode.Model.Name}";
                        change.ChangeType = modelNode.Model.PersistentState == PersistentState.Detached
                            ? PendingChangeType.Added
                            : PendingChangeType.Modified;
                        changes.Add(change);
                    }
                    else
                    {
                        //已被删除了,如果不是新建的加入变更列表
                        var removedModel = (ModelBase)_removedItems
                            .Single(t => t is ModelBase m && m.Id == (ModelId)checkout.TargetId);
                        if (removedModel.PersistentState != PersistentState.Detached)
                        {
                            var change = new PendingChange();
                            change.Target = removedModel;
                            change.DisplayType = removedModel.ModelType.ToString();
                            change.DisplayName = $"{AppNameGetter(removedModel.AppId)}.{removedModel.Name}";
                            change.ChangeType = PendingChangeType.Deleted;
                            changes.Add(change);
                        }
                    }
                }
                    break;
                case DesignNodeType.ModelRootNode:
                {
                    var modelRootNode =
                        (ModelRootNode)DesignTree.FindNode(DesignNodeType.ModelRootNode, checkout.TargetId)!;
                    var change = new PendingChange();
                    change.Target = modelRootNode.RootFolder;
                    change.DesignNode = modelRootNode;
                    change.DisplayType = "Folder";
                    change.DisplayName = $"{modelRootNode.Parent!.Label.Value}.{modelRootNode.Label.Value}";
                    change.ChangeType = PendingChangeType.Modified;
                    changes.Add(change);
                }
                    break;
                default:
                    throw new NotImplementedException(checkout.NodeType.ToString());
            }
        }

        return changes;
    }

    public void AddRemovedItem(object item) => _removedItems.Add(item);

    public void ClearRemovedItems() => _removedItems.Clear();

    #region ====IModelContainer====

    public IEnumerable<ApplicationModel> GetApplications()
        => DesignTree.AppRootNode.Children.Select(n => n.Model);

    public ApplicationModel GetApplicationModel(int appId)
        => DesignTree.FindApplicationNode(appId)!.Model;

    public EntityModel GetEntityModel(ModelId modelId)
        => (EntityModel)DesignTree.FindModelNode(modelId)!.Model;

    #endregion
}

internal sealed class DesignTimeContext : IRuntimeContext
{
    public DesignTimeContext(DesignHub designContext)
    {
        _designContext = designContext;
    }

    private readonly DesignHub _designContext;

    public IUserSession? CurrentSession { get; } //TODO: fix

    public ValueTask<ApplicationModel> GetApplicationAsync(int appId)
    {
        throw new NotImplementedException();
    }

    public ValueTask<T> GetModelAsync<T>(ModelId modelId) where T : ModelBase
    {
        return new ValueTask<T>((T)_designContext.DesignTree.FindModelNode(modelId)!.Model);
    }

    public void InvalidModelsCache(string[]? services, ModelId[]? others, bool byPublish)
    {
        throw new NotImplementedException();
    }

    public async ValueTask<AnyValue> InvokeAsync<T>(string service, T args) where T : struct, IAnyArgs =>
        await Channel.Provider.Invoke(service, args);
}