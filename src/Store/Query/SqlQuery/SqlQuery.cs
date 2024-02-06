using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AppBoxCore;
using AppBoxStore.Utils;

namespace AppBoxStore;

public sealed class SqlQuery<TEntity> : SqlQueryBase, ISqlEntityQuery
    where TEntity : SqlEntity, new()
{
    #region ====Ctor====

    public SqlQuery(long entityModelID)
    {
        T = new EntityExpression(entityModelID, this);
    }

    // /// <summary>
    // /// 仅用于加载EntitySet
    // /// </summary>
    // internal SqlQuery(SqlIncluder root)
    // {
    //     T = ((EntitySetExpression)root.Expression).RootEntityExpression;
    //     T.User = this;
    //     _rootIncluder = root;
    // }

    #endregion

    #region ====Fields & Properties====

    private IList<SqlSelectItemExpression>? _selects;
    private IList<SqlSortItem>? _sortItems;

    /// <summary>
    /// Query Target
    /// </summary>
    public EntityExpression T { get; }

    public override EntityPathExpression this[string name] => T[name];

    /// <summary>
    /// 筛选器
    /// </summary>
    public Expression? Filter { get; private set; }

    /// <summary>
    /// 用于EagerLoad导航属性 
    /// </summary>
    private SqlIncluder? _rootIncluder;

    public IList<SqlSelectItemExpression>? Selects => _selects ??= new List<SqlSelectItemExpression>();

    public IList<SqlSortItem> SortItems => _sortItems ??= new List<SqlSortItem>();

    public bool HasSortItems => _sortItems != null && _sortItems.Count > 0;

    public QueryPurpose Purpose { get; internal set; }

    public bool Distinct { get; set; }

    #region ----分页查询属性----

    public int TakeSize { get; internal set; }

    public int SkipSize { get; internal set; } = 0;

    #endregion

    #region ----树状查询属性----

    public EntityRefModel? TreeParentMember { get; private set; }

    #endregion

    #region ----GroupBy属性----

    public IList<SqlSelectItemExpression>? GroupByKeys { get; private set; }

    public Expression? HavingFilter { get; private set; }

    #endregion

    #endregion

    #region ====Top & Page & Distinct Methods====

    public SqlQuery<TEntity> Take(int rows)
    {
        if (rows < 0) throw new ArgumentOutOfRangeException();
        TakeSize = rows;
        return this;
    }

    public SqlQuery<TEntity> Skip(int rows)
    {
        if (rows < 0) throw new ArgumentOutOfRangeException();

        SkipSize = rows;
        return this;
    }

    #endregion

    #region ====Include Methods====

    // public SqlIncluder Include(Func<EntityExpression, MemberExpression> selector,
    //     string? alias = null)
    // {
    //     if (_rootIncluder == null) _rootIncluder = new SqlIncluder(T);
    //     return _rootIncluder.ThenInclude(selector, alias);
    // }

    #endregion

    #region ====Select Methods====

    public void AddSelectItem(SqlSelectItemExpression item)
    {
        item.Owner = this;
        Selects!.Add(item);
    }

    internal void AddAllSelects(EntityModel model, EntityExpression T, string? fullPath)
    {
        //TODO:考虑特殊SqlSelectItemExpression with *，但只能在fullPath==null时使用
        var members = model.Members;
        for (var i = 0; i < members.Count; i++)
        {
            if (members[i].Type == EntityMemberType.EntityField
                /*|| members[i].Type == EntityMemberType.Aggregate
                || members[i].Type == EntityMemberType.Formula
                || members[i].Type == EntityMemberType.AutoNumber
                || members[i].Type == EntityMemberType.AggregationRefField*/)
            {
                var alias = fullPath == null ? members[i].Name : $"{fullPath}.{members[i].Name}";
                var si = new SqlSelectItemExpression(T[members[i].Name], alias);
                AddSelectItem(si);
            }
        }
    }

    // public async Task<int> CountAsync()
    // {
    //     Purpose = QueryPurpose.Count;
    //     var model = await RuntimeContext.GetModelAsync<EntityModel>(T.ModelID);
    //     var db = SqlStore.Get(model.SqlStoreOptions.StoreModelId);
    //     var cmd = db.BuildQuery(this);
    //     using var conn = db.MakeConnection();
    //     await conn.OpenAsync();
    //     cmd.Connection = conn;
    //     Log.Debug(cmd.CommandText);
    //
    //     using var reader = await cmd.ExecuteReaderAsync();
    //     if (!await reader.ReadAsync())
    //         return 0;
    //     return reader.GetInt32(0);
    // }

    // public T ToScalar<T>(SqlSelectItem expression)
    // {
    //     throw new NotImplementedException();
    //     //this.Purpose = QueryPurpose.ToScalar;
    //     //this.AddSelectItem(expression.Target);
    //
    //     //var db = SqlStore.Get(this.StoreName);
    //     //var cmd = db.DbCommandBuilder.CreateQueryCommand(this);
    //     //return (T)db.ExecuteScalar(cmd);
    // }

    public async Task<TEntity?> ToSingleAsync()
    {
        Purpose = QueryPurpose.ToSingle;
        var model = await RuntimeContext.GetModelAsync<EntityModel>(T.ModelID);

        //TODO: 添加选择项,暂默认*
        // if (_rootIncluder != null) {
        //     AddAllSelects(model, t, null);
        //     _rootIncluder.addSelects(this, model, null);
        // }

        //递交查询
        var db = SqlStore.Get(model.SqlStoreOptions!.StoreModelId);
        await using var cmd = db.BuildQuery(this);
        await using var conn = await db.OpenConnectionAsync();
        cmd.Connection = conn;
        Log.Debug(cmd.CommandText);

        await using var reader = await cmd.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            var entity = new TEntity(); //Activator.CreateInstance<TEntity>();
            EntityFetchUtil.FillEntity(entity, model, reader, 0);

            // if (_rootIncluder != null)
            //     await _rootIncluder.LoadEntitySets(db, res, null); //TODO:fix txn
            return entity;
        }

        return null;
    }

    public async Task<IList<TEntity>> ToListAsync()
    {
        Purpose = QueryPurpose.ToList;
        var model = await RuntimeContext.GetModelAsync<EntityModel>(T.ModelID);

        // TODO: 添加选择项,暂默认*
        // if (_rootIncluder != null) {
        //     AddAllSelects(model, t, null);
        //     _rootIncluder.addSelects(this, model, null);
        // }

        var db = SqlStore.Get(model.SqlStoreOptions!.StoreModelId);
        await using var cmd = db.BuildQuery(this);
        await using var conn = await db.OpenConnectionAsync();
        cmd.Connection = conn;
        Log.Debug(cmd.CommandText);

        var list = new List<TEntity>();
        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            var entity = new TEntity(); //Activator.CreateInstance<TEntity>();
            EntityFetchUtil.FillEntity(entity, model, reader, 0);
            list.Add(entity);
        }

        // if (_rootIncluder != null && list != null)
        //     await _rootIncluder.LoadEntitySets(db, list, null); //TODO: ***** fix txn
        return list;
    }

    /// <summary>
    /// 动态查询，专用于虚拟代码转换后(无Join)
    /// </summary>
    public Task<IList<TResult>> ToListAsync<TResult>(Func<SqlRowReader, TResult> selector,
        Func<EntityExpression, IEnumerable<Expression>> selects) =>
        ToListInternal(selector, selects(T));

    public Task<IList<TResult>> ToListAsync<TResult>(ISqlQueryJoin join,
        Func<SqlRowReader, TResult> selector,
        Func<EntityExpression, ISqlQueryJoin, IEnumerable<Expression>> selects) =>
        ToListInternal(selector, selects(T, join));

    public Task<IList<TResult>> ToListAsync<TResult>(ISqlQueryJoin join1, ISqlQueryJoin join2,
        Func<SqlRowReader, TResult> selector,
        Func<EntityExpression, ISqlQueryJoin, ISqlQueryJoin, IEnumerable<Expression>> selects) =>
        ToListInternal(selector, selects(T, join1, join2));

    /// <summary>
    /// 动态查询，返回匿名类列表
    /// </summary>
    private async Task<IList<TResult>> ToListInternal<TResult>(Func<SqlRowReader, TResult> selector,
        IEnumerable<Expression> selectItem)
    {
        var list = new List<TResult>();
        await ToListCore(selector, selectItem, r => list.Add(r));
        return list;
    }

    public Task<DynamicDataSet> ToDataSetAsync(Func<SqlRowReader, DynamicEntity> selector,
        DynamicFieldInfo[] fields, Func<EntityExpression, IEnumerable<Expression>> selects) =>
        ToDataSetInternal(selector, fields, selects(T));

    /// <summary>
    /// 动态查询，返回动态数据集
    /// </summary>
    private async Task<DynamicDataSet> ToDataSetInternal(Func<SqlRowReader, DynamicEntity> selector,
        DynamicFieldInfo[] fields, IEnumerable<Expression> selectItem)
    {
        var ds = new DynamicDataSet(fields);
        await ToListCore(selector, selectItem, e => ds.Add(e));
        return ds;
    }

    private async Task ToListCore<TResult>(Func<SqlRowReader, TResult> selector,
        IEnumerable<Expression> selectItem, Action<TResult> addItem)
    {
        //if (SkipSize > -1 && !HasSortItems)
        //    throw new ArgumentException("Paged query must has sort items."); //TODO:加入默认主键排序

        Purpose = QueryPurpose.ToList;

        _selects?.Clear();
        foreach (var item in selectItem)
        {
            AddSelectItem(new SqlSelectItemExpression(item));
        }

        if (_selects!.Count == 0)
            throw new ArgumentException("must select some one");

        //递交查询
        var model = await RuntimeContext.GetModelAsync<EntityModel>(T.ModelID);
        var db = SqlStore.Get(model.SqlStoreOptions!.StoreModelId);
        await using var cmd = db.BuildQuery(this);
        await using var conn = db.MakeConnection();
        await conn.OpenAsync();
        cmd.Connection = conn;
        Log.Debug(cmd.CommandText);

        var list = new List<TResult>();
        try
        {
            await using var reader = await cmd.ExecuteReaderAsync();
            var rr = new SqlRowReader(reader);
            while (await reader.ReadAsync())
            {
                addItem(selector(rr));
            }
        }
        catch (Exception ex)
        {
            Log.Warn($"Exec sql error: {ex.Message}\n{cmd.CommandText}");
            throw;
        }
    }

    /// <summary>
    /// 返回树状结构的实体集合
    /// </summary>
    /// <param name="childrenMember">eg: t => t["Children"]</param>
    /// <returns></returns>
    public async Task<IList<TEntity>> ToTreeAsync(Func<EntityExpression, EntityPathExpression> childrenMember)
    {
        Purpose = QueryPurpose.ToTree;
        var children = (EntitySetExpression)childrenMember(T);
        var model = await RuntimeContext.GetModelAsync<EntityModel>(T.ModelID);
        var childrenModel = (EntitySetModel)model.GetMember(children.Name)!;
        TreeParentMember = (EntityRefModel)model.GetMember(childrenModel.RefMemberId)!;

        AddAllSelects(model, T, null);

        //TODO:考虑EntitySet自动排序

        //如果没有设置任何条件，则设置默认条件为查询根级开始
        if (Expression.IsNull(Filter))
        {
            foreach (var fk in TreeParentMember.FKMemberIds)
            {
                AndWhere(t => t[model.GetMember(fk)!.Name] == new ConstantExpression(null));
            }
        }

        var db = SqlStore.Get(model.SqlStoreOptions!.StoreModelId);
        await using var cmd = db.BuildQuery(this);
        await using var conn = await db.OpenConnectionAsync();
        cmd.Connection = conn;
        Log.Debug(cmd.CommandText);

        var list = new List<TEntity>();
        var allList = new List<TEntity>();
        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            var entity = new TEntity(); //Activator.CreateInstance<TEntity>();
            EntityFetchUtil.FillEntity(entity, model, reader, 0);

            var treeLevel = reader.GetInt32(reader.FieldCount - 1);
            if (treeLevel == 0)
            {
                list.Add(entity);
            }
            else
            {
                var parent = FindParent(TreeParentMember, entity, allList);
                //add child to parent.children list
                var childrenList = (EntitySet<TEntity>)GetNaviPropForFetch(parent, childrenModel.MemberId);
                childrenList.Add(entity);
            }

            allList.Add(entity);
        }

        allList.Clear();
        return list;
    }

    /// <summary>
    /// 返回树状结构的路径, eg: 根节点/子节点/子子节点
    /// </summary>
    /// <param name="parentMember">指向上级的EntityRef成员 eg: t => t["Parent"]</param>
    /// <param name="textMember">指向用于显示的文本成员</param>
    public async Task<TreePath?> ToTreePathAsync(Func<EntityExpression, EntityPathExpression> parentMember,
        Func<EntityExpression, EntityPathExpression> textMember)
    {
        if (Expression.IsNull(Filter))
            throw new Exception("Must set filter to single entity");
        var parent = parentMember(T);
        if (parent is not EntityExpression)
            throw new Exception("Parent is not EntityRef member");

        var model = await RuntimeContext.GetModelAsync<EntityModel>(T.ModelID);
        if (!model.SqlStoreOptions!.HasPrimaryKeys || model.SqlStoreOptions.PrimaryKeys.Length > 1)
            throw new Exception("仅支持具备单一主键的树状实体");

        //验证上级非聚合引用，且引用目标为自身
        var entityRefModel = (EntityRefModel)model.GetMember(parent.Name!)!;
        if (entityRefModel.IsAggregationRef)
            throw new Exception("不支持上级成员为聚合引用");
        if (entityRefModel.RefModelIds[0] != model.Id)
            throw new Exception("当前实体非树状结构");

        var pkName = model.GetMember(model.SqlStoreOptions.PrimaryKeys[0].MemberId)!.Name;
        var fkName = model.GetMember(entityRefModel.FKMemberIds[0])!.Name;

        Purpose = QueryPurpose.ToTreePath;
        AddSelectItem(new SqlSelectItemExpression(T[pkName], "Id"));
        AddSelectItem(new SqlSelectItemExpression(T[fkName], "ParentId"));
        AddSelectItem(new SqlSelectItemExpression(textMember(T), "Text"));

        //开始执行查询并转换
        var db = SqlStore.Get(model.SqlStoreOptions!.StoreModelId);
        await using var cmd = db.BuildQuery(this);
        await using var conn = await db.OpenConnectionAsync();
        cmd.Connection = conn;
        Log.Debug(cmd.CommandText);

        var list = new List<TreePathNode>();
        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            var node = new TreePathNode(reader.GetValue(0), reader.GetString(2));
            list.Add(node);
        }

        return new TreePath(list);
    }

    /// <summary>
    /// 用于树状结构填充时查找指定实体的上级
    /// </summary>
    private static TEntity FindParent(EntityRefModel parentModel, TEntity entity,
        IList<TEntity> from)
    {
        var model = parentModel.Owner;
        var pks = model.SqlStoreOptions!.PrimaryKeys;
        var memberValueGetter = new EntityMemberValueGetter();
        for (var i = from.Count - 1; i >= 0; i--) //倒查
        {
            var allSame = true;
            for (var j = 0; j < parentModel.FKMemberIds.Length; j++)
            {
                entity.WriteMember(parentModel.FKMemberIds[j], ref memberValueGetter,
                    EntityMemberWriteFlags.None);
                var fkValue = memberValueGetter.Value;
                from[i].WriteMember(pks[j].MemberId, ref memberValueGetter,
                    EntityMemberWriteFlags.None);
                var pkValue = memberValueGetter.Value;
                if (!fkValue.Equals(pkValue))
                {
                    allSame = false;
                    break;
                }
            }

            if (allSame)
                return from[i];
        }

        throw new Exception("Can't find parent");
    }

    /// <summary>
    /// 初始化(读取或新建)实体的导航属性
    /// </summary>
    private static object GetNaviPropForFetch(SqlEntity entity, short naviMemberId)
    {
        // 先判断是否已初始化过
        var memberValueGetter = new EntityMemberValueGetter();
        entity.WriteMember(naviMemberId, ref memberValueGetter, EntityMemberWriteFlags.None);
        if (!memberValueGetter.Value.IsEmpty)
            return memberValueGetter.Value.BoxedValue!;

        // 初始化导航属性的实例
        var initiator = new EntityNaviPropInitiator();
        entity.ReadMember(naviMemberId, ref initiator, EntityMemberWriteFlags.None);
        return initiator.NaviMemberValue;
    }

    #endregion

    #region ====AsXXX Methods====

    // public SqlSubQuery AsSubQuery(params SqlSelectItem[] selectItem)
    // {
    //     if (selectItem == null || selectItem.Length <= 0)
    //         throw new ArgumentException("must select some one");
    //
    //     foreach (var item in selectItem)
    //     {
    //         AddSelectItem(item.Target);
    //     }
    //
    //     return new SqlSubQuery(this);
    // }
    //
    // public SqlFromQuery AsFromQuery(params SqlSelectItem[] selectItem)
    // {
    //     if (selectItem == null || selectItem.Length <= 0)
    //         throw new ArgumentException("must select some one");
    //
    //     foreach (var item in selectItem)
    //     {
    //         AddSelectItem(item.Target);
    //     }
    //
    //     return new SqlFromQuery(this);
    // }

    #endregion

    #region ====Where Methods====

    public SqlQuery<TEntity> Where(Func<EntityExpression, Expression> condition)
    {
        Filter = condition(T);
        return this;
    }

    public SqlQuery<TEntity> Where(ISqlQueryJoin join, Func<EntityExpression, ISqlQueryJoin, Expression> condition)
    {
        Filter = condition(T, join);
        return this;
    }

    public SqlQuery<TEntity> AndWhere(Func<EntityExpression, Expression> condition)
    {
        Filter = Expression.IsNull(Filter)
            ? condition(T)
            : new BinaryExpression(Filter!, condition(T), BinaryOperatorType.AndAlso);
        return this;
    }

    public SqlQuery<TEntity> OrWhere(Func<EntityExpression, Expression> condition)
    {
        Filter = Expression.IsNull(Filter)
            ? condition(T)
            : new BinaryExpression(Filter!, condition(T), BinaryOperatorType.OrElse);
        return this;
    }

    #endregion

    #region ====OrderBy Methods====

    public SqlQuery<TEntity> OrderBy(Func<EntityExpression, Expression> sortItem)
    {
        SortItems.Add(new SqlSortItem(sortItem(T), SortType.ASC));
        return this;
    }

    public SqlQuery<TEntity> OrderByDesc(Func<EntityExpression, Expression> sortItem)
    {
        SortItems.Add(new SqlSortItem(sortItem(T), SortType.DESC));
        return this;
    }

    #endregion

    #region ====GroupBy Methods====

    public SqlQuery<TEntity> GroupBy(Func<EntityExpression, Expression> select)
    {
        GroupByKeys ??= new List<SqlSelectItemExpression>();
        var item = new SqlSelectItemExpression(select(T)) { Owner = this };
        GroupByKeys.Add(item);

        return this;
    }

    public SqlQuery<TEntity> Having(Func<EntityExpression, Expression> condition)
    {
        HavingFilter = condition(T);
        return this;
    }

    #endregion
}