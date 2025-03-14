using AppBoxCore;

namespace AppBoxStore;

public abstract class SqlQueryBase : ISqlJoinable
{
    public string AliasName { get; set; } = null!;

    private IList<SqlJoin>? _joins;
    public bool HasJoins => _joins != null && _joins.Count > 0;
    public IList<SqlJoin> Joins => _joins ??= new List<SqlJoin>();

    public abstract EntityPathExpression this[string name] { get; }
}