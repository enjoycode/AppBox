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
    public static List<EntityMember> GetEntityModelMembers(EntityModel model)
    {
        var list = new List<EntityMember>();
        foreach (var member in model.Members)
        {
            switch (member)
            {
                case EntityFieldMember:
                    list.Add(member);
                    break;
                case EntityRefMember entityRef:
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

    public static Expression BuildExpressionFrom(TreeNode<EntityMember> treeNode, EntityExpression root)
    {
        var temp = treeNode;
        var list = new List<EntityMember>();
        while (temp != null)
        {
            list.Insert(0, temp.Data);
            temp = temp.ParentNode;
        }

        Expression exp = root;
        foreach (var item in list)
        {
            exp = item switch
            {
                EntityFieldMember => ((EntityExpression)exp).F(item.Name),
                EntityRefMember entityRefMember when entityRefMember.IsAggregationRef =>
                    throw new NotSupportedException("Not supported aggregation now"),
                EntityRefMember entityRefMember => ((EntityExpression)exp).R(item.Name, entityRefMember.RefModelIds[0]),
                EntitySetMember entitySetMember => ((EntityExpression)exp).S(entitySetMember.Name,
                    entitySetMember.RefModelId),
                _ => throw new NotSupportedException(item.Type.ToString())
            };
        }

        return exp;
    }

    public static ModelNode[] GetAllSqlEntityModels()
    {
        return DesignHub.Current.DesignTree.FindNodesByType(ModelType.Entity)
            .Where(m => ((EntityModel)m.Model).SqlStoreOptions != null)
            .ToArray();
    }

    public static ModelNode[] GetAllDynamicViewModels()
    {
        return DesignHub.Current.DesignTree.FindNodesByType(ModelType.View)
            .Where(m => ((ViewModel)m.Model).ViewType == ViewModelType.PixUIDynamic)
            .ToArray();
    }
}