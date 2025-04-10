using System;
using System.Data.Common;
using System.Threading.Tasks;
using AppBoxCore;

namespace AppBoxStore;

public sealed class SqlDeleteCommand : SqlQueryBase, ISqlQuery
{
    public SqlDeleteCommand(ModelId entityModelId)
    {
        T = new EntityExpression(entityModelId, this);
    }

    public EntityExpression T { get; }

    public override EntityPathExpression this[string name] => T[name];

    /// <summary>
    /// 筛选器
    /// </summary>
    public Expression Filter { get; private set; } = null!;

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