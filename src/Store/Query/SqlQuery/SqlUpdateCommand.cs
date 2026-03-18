using System.Data.Common;
using AppBoxCore;
using Expression = AppBoxCore.Expression;

namespace AppBoxStore;

public sealed class SqlUpdateCommand : SqlJoinable, ISqlQuery
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
    public Expression[]? OutputItems { get; private set; }

    /// <summary>
    /// 用于回调设置输出结果
    /// </summary>
    internal Action<SqlRowReader>? SetOutputs;

    #endregion

    #region ====IMemberPathBuilder====

    public override EntityFieldExpression F(string name) => T.F(name);
    public override EntityExpression R(string name, long modelId) => T.R(name, modelId);
    public override EntitySetExpression S(string name, long modelId) => T.S(name, modelId);
    public override Expression U(string name) => T.U(name);

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
        params Expression[] selectItem)
    {
        //TODO:验证Selected members
        OutputItems = selectItem;
        var res = new UpdateOutputs<TResult>(selector);
        SetOutputs = res.OnResults;
        return res;
    }

    public UpdateOutputs<TResult> Output<TResult>(Func<SqlRowReader, TResult> selector,
        Func<SqlUpdateCommand, Expression[]> selects)
    {
        return Output(selector, selects(this));
    }

    public async Task<int> ExecAsync(DbTransaction? txn = null)
    {
        var entityModel = await RuntimeContext.GetModelAsync<EntityModel>(T.ModelId);
        var db = SqlStore.Get(entityModel.SqlStoreOptions!.StoreModelId);
        return await db.UpdateAsync(this, entityModel, txn);
    }

    #endregion

    public sealed class UpdateOutputs<T>
    {
        private readonly Func<SqlRowReader, T> _selector;
        private readonly IList<T> _values = new List<T>();

        public T this[int index] => _values[index];

        public int Count => _values.Count;

        internal UpdateOutputs(Func<SqlRowReader, T> selector)
        {
            _selector = selector;
        }

        internal void OnResults(SqlRowReader reader)
        {
            _values.Add(_selector(reader));
        }
    }
}