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
    EntityRefModel? TreeParentMember { get; }

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

    public static void AddAllSelects(this ISqlSelectQuery query, EntityModel model, EntityExpression t,
        string? fullPath)
    {
        //TODO:考虑特殊SqlSelectItemExpression with *，但只能在fullPath==null时使用
        var members = model.Members;
        for (var i = 0; i < members.Count; i++)
        {
            if (members[i].Type == EntityMemberType.EntityField
                /*|| members[i].Type == EntityMemberType.Aggregate
                || members[i].Type == EntityMemberType.Formula
                || members[i].Type == EntityMemberType.AutoNumber
                || members[i].Type == EntityMemberType.AggregationRefField*/)
            {
                var alias = fullPath == null ? members[i].Name : $"{fullPath}.{members[i].Name}";
                var si = new SqlSelectItemExpression(t[members[i].Name], alias);
                query.AddSelectItem(si);
            }
        }
    }
}