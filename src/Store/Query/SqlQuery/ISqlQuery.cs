using AppBoxCore;

namespace AppBoxStore;

public interface ISqlQuery
{
    /// <summary>
    /// 过滤条件
    /// </summary>
    Expression? Filter { get; }
}

public interface ISqlSelectQuery : ISqlQuery
{
    ModelId EntityModelId { get; }

    EntityPathExpression this[string name] { get; }

    string AliasName { get; }

    /// <summary>
    /// 仅用于树结构查询
    /// </summary>
    EntityRefMember? TreeParentMember { get; }

    IList<SqlSelectItemExpression>? Selects { get; }

    IList<SqlOrderBy> SortItems { get; }

    bool HasSortItems { get; }

    int TakeSize { get; }

    int SkipSize { get; }

    /// <summary>
    /// 查询的用途
    /// </summary>
    QueryPurpose Purpose { get; }

    bool Distinct { get; }

    /// <summary>
    /// 分组字段
    /// </summary>
    IList<SqlSelectItemExpression>? GroupByKeys { get; }

    /// <summary>
    /// 分组过滤条件
    /// </summary>
    Expression? HavingFilter { get; }
}

internal static class SqlSelectQueryExtensions
{
    public static void AddSelectItem(this ISqlSelectQuery query, SqlSelectItemExpression item)
    {
        item.Owner = query;
        query.Selects!.Add(item);
    }

    public static async ValueTask AddAllSelects(this ISqlSelectQuery query, EntityModel model, EntityExpression t,
        string? fullPath, bool includeEntityRefFields)
    {
        //TODO:考虑特殊SqlSelectItemExpression with *，但只能在fullPath==null时使用
        var members = model.Members;
        for (var i = 0; i < members.Count; i++)
        {
            if (members[i].Type == EntityMemberType.EntityField)
            {
                var alias = fullPath == null ? members[i].Name : $"{fullPath}.{members[i].Name}";
                var si = new SqlSelectItemExpression(t[members[i].Name], alias);
                query.AddSelectItem(si);
            }
            else if (members[i].Type == EntityMemberType.EntityRefField)
            {
                if (!includeEntityRefFields) continue;

                //转换为eg: t["Customer"]["City"]["Name"]表达式
                var entityRefFieldMember = (EntityRefFieldMember)members[i];
                var currentEntityModel = model;
                EntityPathExpression pathExpression = t;
                for (var j = 0; j < entityRefFieldMember.RefFieldPath.Length; j++)
                {
                    var member = currentEntityModel.GetMember(entityRefFieldMember.RefFieldPath[j], true)!;
                    pathExpression = pathExpression[member.Name];
                    if (member is EntityRefMember entityRefMember)
                    {
                        if (entityRefMember.IsAggregationRef) throw new NotImplementedException();
                        currentEntityModel =
                            await RuntimeContext.GetModelAsync<EntityModel>(entityRefMember.RefModelIds[0]);
                    }
                    else if (member.Type != EntityMemberType.EntityField)
                    {
                        throw new NotSupportedException();
                    }
                }

                var alias = fullPath == null ? entityRefFieldMember.Name : $"{fullPath}.{entityRefFieldMember.Name}";
                var si = new SqlSelectItemExpression(pathExpression, alias);
                query.AddSelectItem(si);
            }
        }
    }
}