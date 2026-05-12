using AppBoxCore;

namespace AppBoxDesign;

/// <summary>
/// 新建实体成员的命令
/// </summary>
internal static class NewEntityMember
{
    private static void Validate(ModelNode node, string memberName)
    {
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
    }

    internal static EntityFieldMember NewEntityField(DesignHub ctx, ModelNode node, string memberName,
        EntityFieldType fieldType, bool allowNull,
        ModelId? enumModelId = null, string? defaultValue = null)
    {
        Validate(node, memberName);

        var model = (EntityModel)node.Model;
        var field = new EntityFieldMember(model, memberName, fieldType, allowNull);
        if (fieldType == EntityFieldType.Enum)
        {
            if (enumModelId.HasValue)
                field.EnumModelId = enumModelId.Value;
            else
                throw new Exception("Enum field must assign a EnumModel");
        }

        //默认值处理
        if (!string.IsNullOrEmpty(defaultValue))
        {
            if (!ValidateDefaultValue(field, defaultValue, ctx, out var error))
                throw new Exception($"Default value invalid: {error}");
            field.DefaultValue = defaultValue;
        }
        else
        {
            if (!field.AllowNull && field.FieldType != EntityFieldType.Binary &&
                model.PersistentState != PersistentState.Detached)
                throw new Exception($"Must set default value when not AllowNull");
        }

        return field;
    }

    private static bool ValidateDefaultValue(EntityFieldMember field, string defaultValue,
        DesignHub ctx, out string? error)
    {
        error = "Format error";
        switch (field.FieldType)
        {
            case EntityFieldType.String: return true;
            case EntityFieldType.DateTime:
                return DateTime.TryParse(defaultValue, out _) || defaultValue == "DateTime.Now";
            case EntityFieldType.Bool:
                return bool.TryParse(defaultValue, out _);
            case EntityFieldType.Byte:
                return byte.TryParse(defaultValue, out _);
            case EntityFieldType.Short:
                return short.TryParse(defaultValue, out _);
            case EntityFieldType.Int:
                return int.TryParse(defaultValue, out _);
            case EntityFieldType.Long:
                return long.TryParse(defaultValue, out _);
            case EntityFieldType.Float:
                return float.TryParse(defaultValue, out _);
            case EntityFieldType.Double:
                return double.TryParse(defaultValue, out _);
            case EntityFieldType.Decimal:
                return decimal.TryParse(defaultValue, out _);
            case EntityFieldType.EntityId:
            case EntityFieldType.Guid:
                return Guid.TryParse(defaultValue, out _) || defaultValue == "Guid.Empty";
            case EntityFieldType.Enum:
                if (!int.TryParse(defaultValue, out var enumValue))
                {
                    error = "Enum default value must be an integer";
                    return false;
                }

                var enumModelNode = ctx.DesignTree.FindModelNode(field.EnumModelId!.Value)!;
                var enumModel = (EnumModel)enumModelNode.Model;
                if (!enumModel.Items.Exists(t => t.Value == enumValue))
                {
                    error = $"Enum default value must exists in [{enumModel.Name}]";
                    return false;
                }

                return true;
        }

        return false;
    }

    internal static EntityMember[] NewEntityRef(DesignHub ctx, ModelNode node, string name,
        string[] refIds, bool allowNull)
    {
        if (refIds.Length == 0)
            throw new ArgumentException("EntityRef target is empty");

        Validate(node, name);
        var model = (EntityModel)node.Model;

        //检查所有引用类型是否有效
        var refModels = new EntityModel[refIds.Length];
        for (var i = 0; i < refIds.Length; i++)
        {
            var refNode = ctx.DesignTree.FindModelNode(refIds[i]);
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

        var res = new List<EntityMember>();
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
                var pkMemberModel = (EntityFieldMember)refModels[0].GetMember(pk.MemberId)!;
                var fkName = $"{name}{pkMemberModel.Name}";
                if (model.Members.Any(t => t.Name == fkName))
                    throw new Exception($"Name has exists: {fkName}");
                var fk = new EntityFieldMember(model, fkName, pkMemberModel.FieldType, allowNull,
                    true);
                res.Add(fk);
                fkMemberIds[i] = fk.MemberId;
            }
        }
        else
        {
            if (model.Members.Any(t => t.Name == $"{name}Id"))
                throw new Exception($"Name has exists: {name}Id");
            // 添加外键Id列, eg: Customer -> CustomerId
            var fkId =
                new EntityFieldMember(model, $"{name}Id", EntityFieldType.EntityId, allowNull, true);
            res.Add(fkId);
            fkMemberIds = [fkId.MemberId];
        }

        // 如果为聚合引用则添加对应的Type列, eg: CostBill -> CostBillType
        EntityRefMember entityRef;
        if (refIds.Length > 1)
        {
            throw new NotImplementedException("未实现聚合引用");
            // var fkType = new EntityFieldMember(model, $"{name}Type", EntityFieldType.Long, allowNull, true);
            // entityRef = new EntityRefMember(model, name, refIds.Cast<ulong>().ToList(), fkMemberIds, fkType.MemberId);
        }
        else
        {
            entityRef = new EntityRefMember(model, name, refIds[0], fkMemberIds, allowNull /*TODO:入参指明是否外键约束 */);
        }

        res.Add(entityRef);

        return res.ToArray();
    }

    internal static EntitySetMember NewEntitySet(DesignHub ctx, ModelNode node, string name,
        ModelId refModelId, short refMemberId)
    {
        Validate(node, name);

        //验证引用目标是否存在
        var target = ctx.DesignTree.FindModelNode(refModelId);
        if (target == null)
            throw new Exception("Can't find EntityRef");
        var targetModel = (EntityModel)target.Model;
        var targetMember = targetModel.GetMember(refMemberId)!;
        if (targetMember.Type != EntityMemberType.EntityRef)
            throw new Exception("Target member is not EntityRef");

        var model = (EntityModel)node.Model;
        var entitySet = new EntitySetMember(model, name, refModelId, refMemberId);

        return entitySet;
    }

    internal static EntityRefFieldMember NewEntityRefField(DesignHub ctx, ModelNode node, string name, string path)
    {
        Validate(node, name);

        var model = (EntityModel)node.Model;
        //验证路径
        if (!path.Contains('.')) throw new ArgumentException("path invalid.");
        var items = path.Split('.');
        var refFieldPath = new short[items.Length];
        var currentModel = model;
        for (var i = 0; i < items.Length; i++)
        {
            var member = currentModel.GetMember(items[i], false);
            if (member == null)
                throw new ArgumentException("Can't find member");
            refFieldPath[i] = member.MemberId;
            if (i == items.Length - 1)
            {
                if (member.Type != EntityMemberType.EntityField)
                    throw new ArgumentException("Last member must be EntityField");
            }
            else
            {
                if (member is not EntityRefMember entityRefMember)
                    throw new ArgumentException("None last member must be EntityRef");
                if (entityRefMember.IsUnionRef)
                    throw new NotImplementedException("UnionRef is not implemented");

                currentModel = (EntityModel)ctx.DesignTree.FindModelNode(entityRefMember.RefModelIds[0])!.Model;
            }
        }

        var result = new EntityRefFieldMember(model, name, refFieldPath);
        return result;
    }
}