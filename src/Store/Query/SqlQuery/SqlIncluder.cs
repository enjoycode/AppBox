using System.Data.Common;
using System.Diagnostics;
using AppBoxCore;
using AppBoxStore.Utils;
using Expression = AppBoxCore.Expression;
using ExpressionType = AppBoxCore.ExpressionType;
using static AppBoxStore.StoreLogger;

namespace AppBoxStore;

public abstract class SqlIncluder
{
    protected SqlIncluder(bool includeEntityRefFields)
    {
        IncludeEntityRefFields = includeEntityRefFields;
    }

    protected readonly bool IncludeEntityRefFields;

    /// <summary>
    /// 上级，根级为null
    /// </summary>
    public SqlIncluder? Parent { get; protected init; }

    public List<SqlIncluder>? Children { get; private set; }

    /// <summary>
    /// Only EntityExpression | EntitySetExpression now.
    /// </summary>
    public Expression Expression { get; protected init; } = null!;

    protected string ExpressionName => ((IEntityPathExpression)Expression).Name!;

    protected SqlIncluder GetRoot() => Parent == null ? this : Parent.GetRoot();

    #region ====Include Methods====

    public SqlIncluder<TChild> Include<TChild>(Func<EntityExpression, Expression> selector,
        bool includeEntityRefFields = false) where TChild : SqlEntity, IEntity, new()
    {
        var root = GetRoot();
        return root.IncludeInternal<TChild>(selector((EntityExpression)root.Expression), includeEntityRefFields);
    }

    public SqlIncluder<TChild> ThenInclude<TChild>(Func<EntityExpression, Expression> selector,
        bool includeEntityRefFields = false) where TChild : SqlEntity, IEntity, new()
    {
        return IncludeInternal<TChild>(Expression.Type == ExpressionType.EntitySetExpression
            ? selector(((EntitySetExpression)Expression).RootEntityExpression)
            : selector((EntityExpression)Expression), includeEntityRefFields);
    }

    private SqlIncluder<TChild> IncludeInternal<TChild>(Expression member, bool includeEntityRefFields)
        where TChild : SqlEntity, IEntity, new()
    {
        if (member.Type != ExpressionType.EntitySetExpression && member.Type != ExpressionType.EntityExpression)
            throw new ArgumentException("Only supports EntitySetExpression and EntityExpression now");

        //TODO: 处理如Order.Customer.City多层级
        //判断Include的Owner是否相同
        //if (!ReferenceEquals(member.Owner, MemberExpression))
        //    throw new ArgumentException("Owner not same");
        if (Children == null)
        {
            var child = new SqlIncluder<TChild>(this, member, includeEntityRefFields);
            Children = [child];
            return child;
        }

        var memberName = ((IEntityPathExpression)member).Name;
        var found = Children.FindIndex(t => t.Expression.Type == member.Type
                                            && t.ExpressionName == memberName);
        if (found >= 0)
            return (SqlIncluder<TChild>)Children[found];
        var res = new SqlIncluder<TChild>(this, member, includeEntityRefFields);
        Children.Add(res);
        return res;
    }

    // private EntityExpression GetTopOwner(EntityPathExpression member)
    // {
    //     while (true)
    //     {
    //         if (Expression.IsNull(member.Owner!.Owner)) return member.Owner;
    //         member = member.Owner;
    //     }
    // }

    #endregion

    internal async ValueTask LoopAddSelects(ISqlSelectQuery query, EntityModel model, string? path)
    {
        //注意：子级加在前面
        if (Children != null)
        {
            for (var i = 0; i < Children.Count; i++)
            {
                await Children[i].LoopAddSelects(query, model, path);
            }
        }

        if (Expression.Type == ExpressionType.EntityExpression)
        {
            var exp = (EntityExpression)Expression;
            var mm = (EntityRefMember)model.GetMember(exp.Name, true)!;
            if (mm.IsAggregationRef) //TODO:聚合引用转换为Case表达式
                throw new NotImplementedException();

            //注意替换入参支持多级
            model = await RuntimeContext.Current.GetModelAsync<EntityModel>(mm.RefModelIds[0]);
            path = path == null ? exp.Name : $"{path}.{exp.Name}";
            await query.AddAllSelects(model, exp, path, IncludeEntityRefFields);
        }
        //不需要处理EntitySetExpression
    }

    internal abstract ValueTask LoopLoadEntitySets(SqlStore db, SqlEntity owner, DbTransaction? txn);
}

/// <summary>
/// 用于Eager or Explicit loading实体Navigation属性
/// </summary>
public sealed class SqlIncluder<TEntity> : SqlIncluder where TEntity : SqlEntity, new()
{
    /// <summary>
    /// 新建根级
    /// </summary>
    internal SqlIncluder(EntityExpression root) : base(false)
    {
        Debug.Assert(Expression.IsNull(root.Owner));
        Expression = root;
    }

    /// <summary>
    /// 新建子级
    /// </summary>
    internal SqlIncluder(SqlIncluder parent, Expression exp, bool includeEntityRefFields) : base(includeEntityRefFields)
    {
        Parent = parent ?? throw new ArgumentNullException(nameof(parent));
        Expression = exp;
    }

    private DbCommand? _loadEntitySetCmd; //仅用于加载EntitySet，防止重复生成

    #region ====Runtime Methods====

    internal async ValueTask AddSelects(ISqlSelectQuery query, EntityModel model, string? path = null)
    {
        if (Children == null) return;
        for (var i = 0; i < Children.Count; i++)
        {
            await Children[i].LoopAddSelects(query, model, path);
        }
    }

    internal async ValueTask LoadEntitySets(SqlStore db, SqlEntity owner, DbTransaction? txn)
    {
        if (Children == null) return;
        for (var i = 0; i < Children.Count; i++)
        {
            await Children[i].LoopLoadEntitySets(db, owner, txn);
        }
    }

    internal async ValueTask LoadEntitySets<T>(SqlStore db, IList<T> list, DbTransaction? txn)
        where T : SqlEntity
    {
        if (Children == null) return;
        if (Children.All(t => t.Expression.Type != ExpressionType.EntitySetExpression)) return;

        //TODO:考虑一次加载方案
        for (var i = 0; i < list.Count; i++)
        {
            await LoadEntitySets(db, list[i], txn);
        }
    }

    internal override async ValueTask LoopLoadEntitySets(SqlStore db, SqlEntity owner, DbTransaction? txn)
    {
        if (Expression.Type != ExpressionType.EntitySetExpression) return;

        //判断是否已经生成加载命令
        var ownerModel = await RuntimeContext.Current.GetModelAsync<EntityModel>(owner.ModelId);
        var entitySetMember = (EntitySetMember)ownerModel.GetMember(ExpressionName, true)!;
        var setModel = await RuntimeContext.Current.GetModelAsync<EntityModel>(entitySetMember.RefModelId);
        var entityExpression = ((EntitySetExpression)Expression).RootEntityExpression;
        if (_loadEntitySetCmd == null)
        {
            var fkmm = (EntityRefMember)setModel.GetMember(entitySetMember.RefMemberId, true)!;
            var q = new SqlFetchEntitySetQuery(entityExpression); // Should use SqlQuery<TEntity>?
            //生成条件
            for (var i = 0; i < fkmm.FKMemberIds.Length; i++)
            {
                //外键字段 == 当前主键字段
                var fkExp = q.F(setModel.GetMember(fkmm.FKMemberIds[i], true)!.Name);
                q.AndWhere(fkExp == new SqlParameterExpression());
            }

            //AddSelects
            await AddSelects(q, setModel); //注意在前面
            await q.AddAllSelects(setModel, entityExpression, null,
                IncludeEntityRefFields);

            _loadEntitySetCmd = db.BuildQuery(q);
        }

        //重设加载命令外键参数值为主键值
        for (var i = 0; i < ownerModel.SqlStoreOptions!.PrimaryKeys.Length; i++)
        {
            var pk = ownerModel.SqlStoreOptions.PrimaryKeys[i];
            var pkValueGetter = new EntityMemberValueGetter();
            owner.WriteMember(pk.MemberId, ref pkValueGetter, EntityMemberWriteFlags.None);
            _loadEntitySetCmd.Parameters[i].Value = pkValueGetter.Value.BoxedValue;
        }

        //开始执行sql加载
        await using var conn = db.MakeConnection();
        await conn.OpenAsync();
        _loadEntitySetCmd.Connection = conn;
        Logger.Debug(_loadEntitySetCmd.CommandText);

        await using var reader = await _loadEntitySetCmd.ExecuteReaderAsync();
        var entitySet = (EntitySet<TEntity>)EntityFetchUtil.GetNaviPropForFetch(owner, entitySetMember.MemberId);
        while (await reader.ReadAsync())
        {
            var obj = new TEntity();
            await EntityFetchUtil.FillEntity(obj, setModel, reader, 0);
            entitySet.Add(obj);
        }

        //继续加载子级
        await LoadEntitySets(db, entitySet, txn);
    }

    #endregion

    #region ====SqlFetchEntitySetQuery====

    /// <summary>
    /// 专用于加载EntitySet成员的查询
    /// </summary>
    private class SqlFetchEntitySetQuery : SqlJoinable, ISqlSelectQuery
    {
        public SqlFetchEntitySetQuery(EntityExpression entityExpression)
        {
            T = entityExpression;
            T.User = this;
        }

        public EntityExpression T { get; }

        public ModelId EntityModelId => T.ModelId;

        public EntityRefMember? TreeParentMember => null;
        public IList<SqlSelectItemExpression>? Selects { get; } = new List<SqlSelectItemExpression>();
        public IList<SqlOrderBy> SortItems { get; } = null!;
        public bool HasSortItems => false;
        public int TakeSize => 0;
        public int SkipSize => 0;
        public QueryPurpose Purpose => QueryPurpose.ToList;
        public bool Distinct => false;
        public IList<SqlSelectItemExpression>? GroupByKeys => null;
        public Expression? HavingFilter => null;
        public Expression? Filter { get; private set; }

        #region ====IMemberPathBuilder====

        public override EntityFieldExpression F(string name) => T.F(name);
        public override EntityExpression R(string name, long modelId) => T.R(name, modelId);
        public override EntitySetExpression S(string name, long modelId) => T.S(name, modelId);
        public override Expression U(string name) => T.U(name);

        #endregion

        public void AndWhere(Expression condition)
        {
            Filter = Expression.IsNull(Filter)
                ? condition
                : new BinaryExpression(Filter!, condition, BinaryOperatorType.AndAlso);
        }
    }

    #endregion
}