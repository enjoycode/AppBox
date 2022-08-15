using AppBoxCore;

namespace AppBoxDesign;

public sealed class DesignHub : IDesignContext, IDisposable
{
    static DesignHub()
    {
        //注册设计时序列化器，仅用于向前端序列化，大部分不需要反序列化
        TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.EntityModelVO,
            typeof(EntityModelVO)));
        TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.EntityMemberVO,
            typeof(EntityMemberVO)));
        TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.EntityFieldVO,
            typeof(EntityFieldVO)));
        TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.EntityRefVO,
            typeof(EntityRefVO)));
        TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.EntitySetVO,
            typeof(EntitySetVO)));
        TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.DesignTree,
            typeof(DesignTree)));
        TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.NewNodeResult,
            typeof(NewNodeResult)));
        TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.CodeProblem,
            typeof(CodeProblem)));
        TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.CompletionItem,
            typeof(GetCompletion.CompletionItem)));
        TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.ChangedModel,
            typeof(ChangedModel)));

        TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.FieldWithOrder,
            typeof(FieldWithOrder), () => new FieldWithOrder()));
    }

    public DesignHub(IDeveloperSession session)
    {
        Session = session;
        TypeSystem = new TypeSystem();
        DesignTree = new DesignTree(this);
    }

    public readonly IDeveloperSession Session;
    public readonly DesignTree DesignTree;
    internal readonly TypeSystem TypeSystem;

    /// <summary>
    /// 用于发布时暂存挂起的修改
    /// </summary>
    internal object[]? PendingChanges { get; set; }

    public void Dispose()
    {
        //TODO: stop debugger if has
        TypeSystem.Dispose();
    }

    #region ====IDesignContext====

    public ApplicationModel GetApplicationModel(int appId)
        => DesignTree.FindApplicationNode(appId)!.Model;

    public EntityModel GetEntityModel(ModelId modelID)
        => (EntityModel)DesignTree.FindModelNode(ModelType.Entity, modelID)!.Model;

    #endregion
}