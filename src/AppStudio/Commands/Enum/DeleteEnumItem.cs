using AppBoxCore;

namespace AppBoxDesign;

internal static class DeleteEnumItem
{
    internal static async ValueTask Execute(DesignHub context, ModelNode node, EnumItem member)
    {
        if (!node.IsCheckoutByMe)
            throw new Exception("Has not checkout");

        var model = (EnumModel)node.Model;

        //查找成员引用
        var refs = await ReferenceService.FindEnumItemReferencesAsync(context, node, member.Name);
        if (refs.Count > 0) //有引用项不做删除操作
        {
            throw new Exception("Member has reference, can't delete it");
        }

        //移除成员
        model.RemoveItem(member);
    }
}