using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Threading.Tasks;
using AppBoxCore;
using Expression = AppBoxCore.Expression;

namespace AppBoxStore;

public sealed class SqlUpdateCommand : SqlQueryBase, ISqlQuery
{
    public SqlUpdateCommand(ModelId entityModelId)
    {
        UpdateItems = new List<Expression>();
        T = new EntityExpression(entityModelId, this);
    }

    #region ====Fields====

    /// <summary>
    /// Query Target
    /// </summary>
    public EntityExpression T { get; }

    public EntityPathExpression this[string name] => T[name];

    /// <summary>
    /// 筛选器
    /// </summary>
    public Expression Filter { get; private set; } = null!;

    /// <summary>
    /// 更新表达式 TODO:使用BlockExpression支持多个t=>{t.V1=t.V1+1; t.V2=t.V2+2}
    /// </summary>
    public List<Expression> UpdateItems { get; }

    /// <summary>
    /// 更新同时输出的成员
    /// </summary>
    public EntityPathExpression[]? OutputItems { get; private set; }

    /// <summary>
    /// 用于回调设置输出结果
    /// </summary>
    internal Action<SqlRowReader>? SetOutputs;

    #endregion

    #region ====Methods====

    /// <summary>
    /// 仅用于虚拟代码直接生成的表达式
    /// </summary>
    public SqlUpdateCommand Update(Expression assignment)
    {
        //TODO:验证
        UpdateItems.Add(assignment);
        return this;
    }

    public SqlUpdateCommand Update(Func<SqlUpdateCommand, Expression> assignment)
    {
        //TODO:验证
        UpdateItems.Add(assignment(this));
        return this;
    }

    /// <summary>
    /// 仅用于虚拟代码直接生成的表达式
    /// </summary>
    public SqlUpdateCommand Where(Expression filter)
    {
        Filter = filter;
        return this;
    }

    public SqlUpdateCommand Where(Func<SqlUpdateCommand, Expression> condition)
    {
        Filter = condition(this);
        return this;
    }

    public UpdateOutputs<TResult> Output<TResult>(Func<SqlRowReader, TResult> selector,
        params EntityPathExpression[] selectItem)
    {
        //TODO:验证Selected members
        OutputItems = selectItem;
        var res = new UpdateOutputs<TResult>(selector);
        SetOutputs = res.OnResults;
        return res;
    }

    public UpdateOutputs<TResult> Output<TResult>(Func<SqlRowReader, TResult> selector,
        Func<SqlUpdateCommand, EntityPathExpression[]> selects)
    {
        return Output(selector, selects(this));
    }

    public Task<int> ExecAsync() => ExecAsync(null);

    public async Task<int> ExecAsync(DbTransaction? txn)
    {
        var entityModel = await RuntimeContext.GetModelAsync<EntityModel>(T.ModelID);
        var db = SqlStore.Get(entityModel.SqlStoreOptions!.StoreModelId);
        return await db.UpdateAsync(this, entityModel, txn);
    }

    #endregion

    public sealed class UpdateOutputs<T>
    {
        private readonly Func<SqlRowReader, T> selector;
        private readonly IList<T> values = new List<T>();

        public T this[int index] => values[index];

        public int Count => values.Count;

        internal UpdateOutputs(Func<SqlRowReader, T> selector)
        {
            this.selector = selector;
        }

        internal void OnResults(SqlRowReader reader)
        {
            values.Add(selector(reader));
        }
    }
}