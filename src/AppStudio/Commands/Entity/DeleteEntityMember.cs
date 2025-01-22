using AppBoxCore;

namespace AppBoxDesign;

internal static class DeleteEntityMember
{
    internal static async ValueTask Execute(ModelNode node, EntityMemberModel member)
    {
        if (!node.IsCheckoutByMe)
            throw new Exception("Has not checkout");

        var model = (EntityModel)node.Model;
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
        var refs = await ReferenceService.FindEntityMemberReferencesAsync(DesignHub.Current, node, member);
        if (refs.Count > 0) //有引用项不做删除操作
        {
            var allSelf = refs.All(r => r.ModelNode == node);
            if (!allSelf)
                throw new Exception("Member has reference, can't delete it");
        }

        //移除成员
        model.RemoveMember(member);
    }
}