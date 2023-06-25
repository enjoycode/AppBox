using AppBoxCore;

namespace AppBoxStore;

public sealed class SqlQueryJoin : SqlQueryBase, ISqlQueryJoin
{
    public SqlQueryJoin(ModelId entityModelID)
    {
        T = new EntityExpression(entityModelID, this);
    }

    /// <summary>
    /// Query Target
    /// </summary>
    public EntityExpression T { get; }

    public override EntityPathExpression this[string name] => T[name];
}