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

    #region ====IMemberPathBuilder====

    public override EntityFieldExpression F(string name) => T.F(name);
    public override EntityExpression R(string name, long modelId) => T.R(name, modelId);
    public override EntitySetExpression S(string name, long modelId) => T.S(name, modelId);
    public override Expression U(string name) => T.U(name);

    #endregion
}