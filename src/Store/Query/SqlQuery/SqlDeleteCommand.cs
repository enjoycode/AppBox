using System;
using System.Data.Common;
using System.Threading.Tasks;
using AppBoxCore;

namespace AppBoxStore;

public sealed class SqlDeleteCommand : SqlJoinable, ISqlQuery
{
    public SqlDeleteCommand(ModelId entityModelId)
    {
        T = new EntityExpression(entityModelId, this);
    }

    public EntityExpression T { get; }

    /// <summary>
    /// 筛选器
    /// </summary>
    public Expression Filter { get; private set; } = null!;

    #region ====IMemberPathBuilder====

    public override EntityFieldExpression F(string name) => T.F(name);
    public override EntityExpression R(string name, long modelId) => T.R(name, modelId);
    public override EntitySetExpression S(string name, long modelId) => T.S(name, modelId);
    public override Expression U(string name) => T.U(name);

    #endregion

    public SqlDeleteCommand Where(Expression condition)
    {
        Filter = condition;
        return this;
    }

    public SqlDeleteCommand Where(Func<SqlDeleteCommand, Expression> condition)
    {
        Filter = condition(this);
        return this;
    }

    public async Task<int> ExecAsync(DbTransaction? txn = null)
    {
        var entityModel = await RuntimeContext.GetModelAsync<EntityModel>(T.ModelId);
        var db = SqlStore.Get(entityModel.SqlStoreOptions!.StoreModelId);
        return await db.DeleteAsync(this, entityModel, txn);
    }
}