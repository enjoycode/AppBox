using AppBoxCore;

namespace AppBoxStore;

public sealed class SqlTable : SqlJoinable //备注曾用名: SqlQueryJoin
{
    public SqlTable(ModelId entityModelId)
    {
        T = new EntityExpression(entityModelId, this);
    }

    /// <summary>
    /// Query Target
    /// </summary>
    public EntityExpression T { get; }

    public override EntityPathExpression this[string name] => T[name];
}