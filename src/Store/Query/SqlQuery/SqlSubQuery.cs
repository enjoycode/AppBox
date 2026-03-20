using AppBoxCore;

namespace AppBoxStore;

/// <summary>
/// Sql子查询
/// </summary>
public sealed class SqlSubQuery : SqlSelectQueryBase, ISqlSelectQuery
{
    internal SqlSubQuery(ISqlSelectQuery target)
    {
        Target = target;
    }

    private Dictionary<string, SqlSelectItemExpression>? _t;

    public ISqlSelectQuery Target { get; }

    public ModelId EntityModelId => FindRootModelId(Target);

    public EntityRefMember? TreeParentMember => null;

    private static ModelId FindRootModelId(ISqlSelectQuery query)
    {
        if (query is SqlSubQuery subQuery)
            FindRootModelId(subQuery.Target);
        return query.EntityModelId;
    }

    #region ====隐式转换====

    public static implicit operator SqlSubQueryExpression(SqlSubQuery subQuery) => new(subQuery);

    #endregion

    #region ====IMemberPathBuilder====

    public override EntityFieldExpression F(string name) => throw new NotSupportedException();
    public override EntityExpression R(string name, long modelId) => throw new NotSupportedException();
    public override EntitySetExpression S(string name, long modelId) => throw new NotSupportedException();
    public override Expression U(string name) => GetMember(name);

    private SqlSelectItemExpression GetMember(string name)
    {
        _t ??= new Dictionary<string, SqlSelectItemExpression>();
        if (_t.TryGetValue(name, out var exists))
            return exists;

        var found = Target.Selects!.SingleOrDefault(m => m.AliasName == name);
        if (Expression.IsNull(found))
            throw new Exception($"{name} not found");

        var member = new SqlSelectItemExpression(found!) { Owner = this };
        _t.Add(name, member);
        return member;
    }

    #endregion

    #region ====Select Methods====

    public async Task<DataTable> ToDataTableAsync(Func<SqlRowReader, DataRow> selector,
        DataColumn[] fields, Func<SqlSubQuery, IEnumerable<Expression>> selects)
    {
        var table = new DataTable(fields);
        await ToListCore(selector, selects(this), e => table.Add(e));
        return table;
    }

    #endregion
}