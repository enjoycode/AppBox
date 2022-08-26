using AppBoxCore;

namespace AppBoxDesign;

internal sealed class DeleteEntityMember : IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        ModelId modelId = args.GetString()!;
        var memberName = args.GetString()!;

        var node = hub.DesignTree.FindModelNode(modelId);
        if (node == null)
            throw new Exception("Can't find Entity");
        if (!node.IsCheckoutByMe)
            throw new Exception("Has not checkout");

        var model = (EntityModel)node.Model;
        var member = model.GetMember(memberName)!;

        //如果EntityField先判断是否自身引用
        if (member.Type == EntityMemberType.EntityField)
        {
            var field = (EntityFieldModel)member;
            if (field.IsPrimaryKey || field.IsForeignKey)
                throw new Exception("Can't delete PrimaryKey or ForeignKey");
            if (field.IsUsedByIndexes())
                throw new Exception("Can't delete with in Index");
        }

        //查找成员引用
        var refs = await ReferenceService.FindEntityMemberReferencesAsync(hub, node, member);
        if (refs.Count > 0) //有引用项不做删除操作
            throw new Exception("Member has reference, can't delete it");

        //移除成员
        model.RemoveMember(member);

        //保存并更新虚拟代码
        await node.SaveAsync(null);
        await hub.TypeSystem.UpdateModelDocumentAsync(node);

        return AnyValue.Empty;
    }
}