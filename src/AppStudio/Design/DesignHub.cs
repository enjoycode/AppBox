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
        TypeSystem = new TypeSystem();
        DesignTree = new DesignTree(this);
    }

    public static DesignHub Current { get; internal set; } = null!;

    internal readonly string SessionName;
    internal readonly Guid LeafOrgUnitId;
    public readonly DesignTree DesignTree;
    internal readonly TypeSystem TypeSystem;

    /// <summary>
    /// 用于发布时暂存挂起的修改
    /// </summary>
    internal object[]? PendingChanges { get; set; }

    internal Func<int, string> AppNameGetter =>
        appId => DesignTree.FindApplicationNode(appId)!.Model.Name;

    internal Func<ModelId, ModelBase> ModelGetter =>
        id => DesignTree.FindModelNode(id)!.Model;

    public void Dispose()
    {
        TypeSystem.Dispose();
    }

    #region ====IModelContainer====

    public ApplicationModel GetApplicationModel(int appId)
        => DesignTree.FindApplicationNode(appId)!.Model;

    public EntityModel GetEntityModel(ModelId modelId)
        => (EntityModel)DesignTree.FindModelNode(modelId)!.Model;

    #endregion
}