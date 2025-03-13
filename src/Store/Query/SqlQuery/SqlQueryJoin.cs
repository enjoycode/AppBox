using AppBoxCore;

namespace AppBoxStore;

public sealed class SqlQueryJoin : SqlQueryBase
{
    public SqlQueryJoin(ModelId entityModelId)
    {
        T = new EntityExpression(entityModelId, this);
    }

    /// <summary>
    /// Query Target
    /// </summary>
    public EntityExpression T { get; }

    public override EntityPathExpression this[string name] => T[name];
}