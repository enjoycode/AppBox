using AppBoxCore;

namespace AppBoxDesign;

/// <summary>
/// 新建实体成员
/// </summary>
internal sealed class NewEntityMember : IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        ModelId modelId = args.GetString()!;
        var memberName = args.GetString()!;
        var entityMemberType = (EntityMemberType)args.GetInt()!.Value;

        var node = hub.DesignTree.FindModelNode(modelId);
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

        var res = entityMemberType switch
        {
            EntityMemberType.EntityField => NewEntityField(model, memberName, ref args),
            EntityMemberType.EntityRef => NewEntityRef(model, memberName, hub, ref args),
            EntityMemberType.EntitySet => NewEntitySet(model, memberName, hub, ref args),
            _ => throw new NotSupportedException($"不支持的实体成员类型: {entityMemberType}")
        };

        //保存并更新虚拟代码
        await node.SaveAsync(null);
        await hub.TypeSystem.UpdateModelDocumentAsync(node);

        return AnyValue.From(res);
    }

    private static EntityMemberVO[] NewEntityField(EntityModel model, string name,
        ref InvokeArgs args)
    {
        var fieldType = (EntityFieldType)args.GetInt()!.Value;
        var allowNull = args.GetBool()!.Value;

        var field = new EntityFieldModel(model, name, fieldType, allowNull);
        model.AddMember(field);
        //TODO:默认值处理

        return new EntityMemberVO[] { EntityFieldVO.From(field) };
    }

    private static EntityMemberVO[] NewEntityRef(EntityModel model, string name, DesignHub hub,
        ref InvokeArgs args)
    {
        var refIds = args.GetArray<string>()!;
        var allowNull = args.GetBool()!.Value;
        if (refIds.Length == 0)
            throw new ArgumentException("EntityRef target is empty");

        //检查所有引用类型是否有效
        var refModels = new EntityModel[refIds.Length];
        for (var i = 0; i < refIds.Length; i++)
        {
            var refNode = hub.DesignTree.FindModelNode(refIds[i]);
            if (refNode == null)
                throw new Exception("EntityRef target not exists");
            var refModel = (EntityModel)refNode.Model;
            if (model.DataStoreKind != refModel.DataStoreKind)
                throw new Exception("Can't reference to different kind store");

            if (model.StoreOptions != null && refModel.StoreOptions != null)
            {
                if (model.DataStoreKind == DataStoreKind.Sql)
                {
                    if (model.SqlStoreOptions!.StoreModelId !=
                        refModel.SqlStoreOptions!.StoreModelId)
                        throw new Exception("Can't reference to different store");
                    if (!refModel.SqlStoreOptions!.HasPrimaryKeys)
                        throw new Exception("Can't reference to entity without primary key");
                }
                else
                    throw new NotImplementedException();
            }

            //TODO:检查聚合引用的所有主键的数量及类型是否一致

            refModels[i] = refModel;
        }

        var res = new List<EntityMemberVO>();
        //检查外键字段名称是否已存在，并且添加外键成员 //TODO:聚合引用检查XXXType是否存在
        short[] fkMemberIds;
        if (model.DataStoreKind == DataStoreKind.Sql)
        {
            var refModel = refModels[0]; //暂聚合引用以第一个的主键作为外键的名称
            var pkLen = refModel.SqlStoreOptions!.PrimaryKeys.Length;
            fkMemberIds = new short[pkLen];
            for (var i = 0; i < pkLen; i++)
            {
                var pk = refModel.SqlStoreOptions!.PrimaryKeys[i];
                var pkMemberModel = (EntityFieldModel)refModels[0].GetMember(pk.MemberId)!;
                var fkName = $"{name}{pkMemberModel.Name}";
                if (model.Members.Any(t => t.Name == fkName))
                    throw new Exception($"Name has exists: {fkName}");
                var fk = new EntityFieldModel(model, fkName, pkMemberModel.FieldType, allowNull,
                    true);
                model.AddMember(fk);
                res.Add(EntityFieldVO.From(fk));
                fkMemberIds[i] = fk.MemberId;
            }
        }
        else
        {
            if (model.Members.Any(t => t.Name == $"{name}Id"))
                throw new Exception($"Name has exists: {name}Id");
            // 添加外键Id列, eg: Customer -> CustomerId
            var fkId =
                new EntityFieldModel(model, $"{name}Id", EntityFieldType.EntityId, allowNull, true);
            model.AddMember(fkId);
            res.Add(EntityFieldVO.From(fkId));
            fkMemberIds = new[] { fkId.MemberId };
        }

        // 如果为聚合引用则添加对应的Type列, eg: CostBill -> CostBillType
        EntityRefModel entityRef;
        if (refIds.Length > 1)
        {
            throw new NotImplementedException("未实现聚合引用");
            // var fkType = new EntityFieldModel(model, $"{name}Type", EntityFieldType.Long, allowNull, true);
            // model.AddMember(fkType);
            // entityRef = new EntityRefModel(model, name, refIds.Cast<ulong>().ToList(), fkMemberIds, fkType.MemberId);
        }
        else
        {
            entityRef = new EntityRefModel(model, name, refIds[0], fkMemberIds, allowNull /*TODO:入参指明是否外键约束 */);
        }

        model.AddMember(entityRef);
        res.Add(EntityRefVO.From(entityRef));

        return res.ToArray();
    }

    private static EntityMemberVO[] NewEntitySet(EntityModel model, string name, DesignHub hub,
        ref InvokeArgs args)
    {
        ModelId refModelId = args.GetString()!;
        var refMemberId = args.GetShort()!.Value;

        //验证引用目标是否存在
        var target = hub.DesignTree.FindModelNode(refModelId);
        if (target == null)
            throw new Exception("Can't find EntityRef");
        var targetModel = (EntityModel)target.Model;
        var targetMember = targetModel.GetMember(refMemberId)!;
        if (targetMember.Type != EntityMemberType.EntityRef)
            throw new Exception("Target member is not EntityRef");

        var entitySet = new EntitySetModel(model, name, refModelId, refMemberId);
        model.AddMember(entitySet);

        return new EntityMemberVO[] { EntitySetVO.From(entitySet) };
    }
}