using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal static class DesignUtils
{
    /// <summary>
    /// 获取实体模型的字段成员(包括EntityRef的字段成员)
    /// </summary>
    /// <param name="model"></param>
    /// <returns></returns>
    public static List<EntityMemberModel> GetEntityModelMembers(EntityModel model)
    {
        var list = new List<EntityMemberModel>();
        foreach (var member in model.Members)
        {
            switch (member)
            {
                case EntityFieldModel:
                    list.Add(member);
                    break;
                case EntityRefModel entityRef:
                {
                    //暂排除聚合引用及循环引用
                    if (!entityRef.IsAggregationRef && !entityRef.RefModelIds.Contains(model.Id))
                        list.Add(member);
                    break;
                }
            }
        }

        return list;
    }

    public static EntityPathExpression BuildExpressionFrom(TreeNode<EntityMemberModel> treeNode, EntityExpression root)
    {
        var temp = treeNode;
        var list = new List<EntityMemberModel>();
        while (temp != null)
        {
            list.Insert(0, temp.Data);
            temp = temp.ParentNode;
        }

        EntityPathExpression exp = root;
        foreach (var item in list)
        {
            exp = exp[item.Name];
        }

        return exp;
    }

    public static ModelNode[] GetAllSqlEntityModels()
    {
        return DesignHub.Current.DesignTree.FindNodesByType(ModelType.Entity)
            .Where(m => ((EntityModel)m.Model).SqlStoreOptions != null)
            .ToArray();
    }
}