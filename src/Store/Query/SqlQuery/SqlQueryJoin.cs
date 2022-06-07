using AppBoxCore;

namespace AppBoxStore;

public sealed class SqlQueryJoin : SqlQueryBase, ISqlQueryJoin
{
    public SqlQueryJoin(long entityModelID)
    {
        T = new EntityExpression(entityModelID, this);
    }

    /// <summary>
    /// Query Target
    /// </summary>
    public EntityExpression T { get; }
}