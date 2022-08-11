using AppBoxCore;

namespace AppBoxDesign;

internal sealed class NewEntityMember : IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        ModelId modelId = args.GetString()!;
        var memberName = args.GetString()!;
        var entityMemberType = (EntityMemberType)args.GetInt();

        var node = hub.DesignTree.FindModelNode(ModelType.Entity, modelId);
        if (node == null)
            throw new Exception("Can't find Entity node");
        var model = (EntityModel)node.Model;
        if (!node.IsCheckoutByMe)
            throw new Exception("Has not checkout");
        if (!CodeUtil.IsValidIdentifier(memberName) ||
            CodeUtil.IsReservedEntityMemberName(memberName))
            throw new Exception("Name is invalid or reserved");
        if (memberName == model.Name)
            throw new Exception("Name can't same with Entity's name");
        if (model.GetMember(memberName, false) != null)
            throw new Exception("Name has exists");

        EntityMemberVO res;
        if (entityMemberType == EntityMemberType.EntityField)
        {
            var memberModel = NewEntityField(model, memberName, ref args);
            res = EntityFieldVO.From(memberModel);
        }
        else
            throw new NotImplementedException();

        //保存并更新虚拟代码
        await node.SaveAsync(null);
        await hub.TypeSystem.UpdateModelDocumentAsync(node);

        return AnyValue.From(res);
    }

    private static EntityFieldModel NewEntityField(EntityModel model, string name,
        ref InvokeArgs args)
    {
        var fieldType = (EntityFieldType)args.GetInt();
        var allowNull = args.GetBool();

        var field = new EntityFieldModel(model, name, fieldType, allowNull);
        model.AddMember(field);
        //TODO:默认值处理
        return field;
    }
}