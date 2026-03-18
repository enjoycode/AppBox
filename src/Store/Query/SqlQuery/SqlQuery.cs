using AppBoxCore;
using AppBoxStore.Utils;
using static AppBoxStore.StoreLogger;

namespace AppBoxStore;

public sealed class SqlQuery<TEntity> : SqlSelectQueryBase, ISqlSelectQuery
    where TEntity : SqlEntity, new()
{
    public SqlQuery(long entityModelId)
    {
        T = new EntityExpression(entityModelId, this);
    }

    #region ====Fields & Properties====

    /// <summary>
    /// Query Target
    /// </summary>
    public EntityExpression T { get; }

    public ModelId EntityModelId => T.ModelId;

    /// <summary>
    /// 用于预先加载(EagerLoad)导航属性 
    /// </summary>
    private SqlIncluder<TEntity>? _rootIncluder;

    #region ----树状查询属性----

    public EntityRefMember? TreeParentMember { get; private set; }

    #endregion

    #endregion

    #region ====Top & Page & Distinct Methods====

    public SqlQuery<TEntity> Take(int rows)
    {
        if (rows <= 0) throw new ArgumentOutOfRangeException(nameof(rows), "Take rows must > 0");
        TakeSize = rows;
        return this;
    }

    public SqlQuery<TEntity> Skip(int rows)
    {
        if (rows < 0) throw new ArgumentOutOfRangeException(nameof(rows), "Skip rows must >= 0");

        SkipSize = rows;
        return this;
    }

    #endregion

    #region ====IMemberPathBuilder====

    public override EntityFieldExpression F(string name) => T.F(name);
    public override EntityExpression R(string name, long modelId) => T.R(name, modelId);
    public override EntitySetExpression S(string name, long modelId) => T.S(name, modelId);
    public override Expression U(string name) => T.U(name);

    #endregion

    #region ====Include Methods====

    public SqlIncluder<TChild> Include<TChild>(Func<EntityExpression, Expression> selector,
        bool includeEntityRefFields = false) where TChild : SqlEntity, IEntity, new()
    {
        _rootIncluder ??= new SqlIncluder<TEntity>(T);
        return _rootIncluder.Include<TChild>(selector, includeEntityRefFields);
    }

    #endregion

    #region ====Select Methods====

    public async Task<int> CountAsync()
    {
        Purpose = QueryPurpose.Count;
        var model = await RuntimeContext.GetModelAsync<EntityModel>(T.ModelId);
        var db = SqlStore.Get(model.SqlStoreOptions!.StoreModelId);
        await using var cmd = db.BuildQuery(this);
        await using var conn = await db.OpenConnectionAsync();
        cmd.Connection = conn;
        Logger.Debug(cmd.CommandText);

        await using var reader = await cmd.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            return 0;
        return reader.GetInt32(0);
    }

    public async Task<TResult?> ToScalarAsync<TResult>(Func<EntityExpression, Expression> select)
    {
        Purpose = QueryPurpose.ToScalar;
        this.AddSelectItem(new SqlSelectItemExpression(select(T)));

        var model = await RuntimeContext.GetModelAsync<EntityModel>(T.ModelId);
        var db = SqlStore.Get(model.SqlStoreOptions!.StoreModelId);
        await using var cmd = db.BuildQuery(this);
        await using var conn = await db.OpenConnectionAsync();
        cmd.Connection = conn;
        Logger.Debug(cmd.CommandText);

        var result = await cmd.ExecuteScalarAsync();
        return (TResult?)result;
    }

    public async Task<TEntity?> ToSingleAsync(bool includeEntityRefFields = false)
    {
        Purpose = QueryPurpose.ToSingle;
        var model = await RuntimeContext.GetModelAsync<EntityModel>(T.ModelId);

        //添加选择项,暂默认*
        if (_rootIncluder != null)
        {
            //注意先加Includer的
            await _rootIncluder.AddSelects(this, model, null);
            await this.AddAllSelects(model, T, null, includeEntityRefFields);
        }
        else if (includeEntityRefFields)
        {
            await this.AddAllSelects(model, T, null, includeEntityRefFields);
        }

        //递交查询
        var db = SqlStore.Get(model.SqlStoreOptions!.StoreModelId);
        await using var cmd = db.BuildQuery(this);
        await using var conn = await db.OpenConnectionAsync();
        cmd.Connection = conn;
        Logger.Debug(cmd.CommandText);

        await using var reader = await cmd.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            var entity = new TEntity(); //Activator.CreateInstance<TEntity>();
            await EntityFetchUtil.FillEntity(entity, model, reader, 0);

            if (_rootIncluder != null)
                await _rootIncluder.LoadEntitySets(db, entity, null /*TODO: fix*/);
            return entity;
        }

        return null;
    }

    public async Task<IList<TEntity>> ToListAsync(bool includeEntityRefFields = false)
    {
        Purpose = QueryPurpose.ToList;
        var model = await RuntimeContext.GetModelAsync<EntityModel>(T.ModelId);

        // 添加选择项,暂默认*
        if (_rootIncluder != null)
        {
            //注意先加Includer的
            await _rootIncluder.AddSelects(this, model, null);
            await this.AddAllSelects(model, T, null, includeEntityRefFields);
        }
        else if (includeEntityRefFields)
        {
            await this.AddAllSelects(model, T, null, includeEntityRefFields);
        }

        var db = SqlStore.Get(model.SqlStoreOptions!.StoreModelId);
        await using var cmd = db.BuildQuery(this);
        await using var conn = await db.OpenConnectionAsync();
        cmd.Connection = conn;
        Logger.Debug(cmd.CommandText);

        var list = new List<TEntity>();
        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            var entity = new TEntity(); //Activator.CreateInstance<TEntity>();
            await EntityFetchUtil.FillEntity(entity, model, reader, 0);
            list.Add(entity);
        }

        if (_rootIncluder != null)
            await _rootIncluder.LoadEntitySets(db, list, null /*TODO: fix*/);
        return list;
    }

    /// <summary>
    /// 动态查询，专用于虚拟代码转换后(无Join)
    /// </summary>
    public Task<IList<TResult>> ToListAsync<TResult>(Func<SqlRowReader, TResult> selector,
        Func<EntityExpression, IEnumerable<Expression>> selects) =>
        ToListInternal(selector, selects(T));

    public Task<IList<TResult>> ToListAsync<TResult>(ISqlJoinable join,
        Func<SqlRowReader, TResult> selector,
        Func<EntityExpression, ISqlJoinable, IEnumerable<Expression>> selects) =>
        ToListInternal(selector, selects(T, join));

    public Task<IList<TResult>> ToListAsync<TResult>(ISqlJoinable join1, ISqlJoinable join2,
        Func<SqlRowReader, TResult> selector,
        Func<EntityExpression, ISqlJoinable, ISqlJoinable, IEnumerable<Expression>> selects) =>
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

    /// <summary>
    /// 动态查询，返回动态数据表
    /// </summary>
    public async Task<DataTable> ToDataTableAsync(Func<SqlRowReader, DataRow> selector,
        DataColumn[] fields, Func<EntityExpression, IEnumerable<Expression>> selects)
    {
        var ds = new DataTable(fields);
        await ToListCore(selector, selects(T), e => ds.Add(e));
        return ds;
    }

    private async Task ToListCore<TResult>(Func<SqlRowReader, TResult> selector,
        IEnumerable<Expression> selectItem, Action<TResult> addItem)
    {
        //if (SkipSize > -1 && !HasSortItems)
        //    throw new ArgumentException("Paged query must has sort items."); //TODO:加入默认主键排序

        Purpose = QueryPurpose.ToList;

        ClearSelects();
        foreach (var item in selectItem)
        {
            this.AddSelectItem(new SqlSelectItemExpression(item));
        }

        if (!HasSelects())
            throw new ArgumentException("must select some one");

        //递交查询
        var model = await RuntimeContext.GetModelAsync<EntityModel>(T.ModelId);
        var db = SqlStore.Get(model.SqlStoreOptions!.StoreModelId);
        await using var cmd = db.BuildQuery(this);
        await using var conn = db.MakeConnection();
        await conn.OpenAsync();
        cmd.Connection = conn;
        Logger.Debug(cmd.CommandText);

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
            Logger.Warn($"Exec sql error: {ex.Message}\n{cmd.CommandText}");
            throw;
        }
    }

    /// <summary>
    /// 返回树状结构的实体集合
    /// </summary>
    /// <param name="childrenMember">eg: t => t.S("Children")</param>
    /// <param name="includeEntityRefFields">default: false</param>
    /// <returns></returns>
    public async Task<IList<TEntity>> ToTreeAsync(Func<EntityExpression, EntitySetExpression> childrenMember,
        bool includeEntityRefFields = false)
    {
        Purpose = QueryPurpose.ToTree;
        var children = childrenMember(T);
        var model = await RuntimeContext.GetModelAsync<EntityModel>(T.ModelId);
        var childrenModel = (EntitySetMember)model.GetMember(children.Name)!;
        TreeParentMember = (EntityRefMember)model.GetMember(childrenModel.RefMemberId)!;

        await this.AddAllSelects(model, T, null, includeEntityRefFields);

        //TODO:考虑EntitySet自动排序

        //如果没有设置任何条件，则设置默认条件为查询根级开始
        if (Expression.IsNull(Filter))
        {
            foreach (var fk in TreeParentMember.FKMemberIds)
            {
                AndWhere(t => t.F(model.GetMember(fk)!.Name) == new ConstantExpression(null));
            }
        }

        var db = SqlStore.Get(model.SqlStoreOptions!.StoreModelId);
        await using var cmd = db.BuildQuery(this);
        await using var conn = await db.OpenConnectionAsync();
        cmd.Connection = conn;
        Logger.Debug(cmd.CommandText);

        var list = new List<TEntity>();
        var allList = new List<TEntity>();
        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            var entity = new TEntity(); //Activator.CreateInstance<TEntity>();
            await EntityFetchUtil.FillEntity(entity, model, reader, 0);

            var treeLevel = reader.GetInt32(reader.FieldCount - 1);
            if (treeLevel == 0)
            {
                list.Add(entity);
            }
            else
            {
                var parent = FindParent(TreeParentMember, entity, allList);
                //add child to parent.children list
                var childrenList =
                    (EntitySet<TEntity>)EntityFetchUtil.GetNaviPropForFetch(parent, childrenModel.MemberId);
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
    /// <param name="parentMember">指向上级的EntityRef成员 eg: t => t.R("Parent")</param>
    /// <param name="textMember">指向用于显示的文本成员</param>
    public async Task<TreePath?> ToTreePathAsync(Func<EntityExpression, EntityExpression> parentMember,
        Func<EntityExpression, Expression> textMember)
    {
        if (Expression.IsNull(Filter))
            throw new Exception("Must set filter to single entity");
        var parent = parentMember(T);

        var model = await RuntimeContext.GetModelAsync<EntityModel>(T.ModelId);
        if (!model.SqlStoreOptions!.HasPrimaryKeys || model.SqlStoreOptions.PrimaryKeys.Length > 1)
            throw new Exception("仅支持具备单一主键的树状实体");

        //验证上级非聚合引用，且引用目标为自身
        var entityRefMember = (EntityRefMember)model.GetMember(parent.Name!)!;
        if (entityRefMember.IsAggregationRef)
            throw new Exception("不支持上级成员为聚合引用");
        if (entityRefMember.RefModelIds[0] != model.Id)
            throw new Exception("当前实体非树状结构");

        var pkName = model.GetMember(model.SqlStoreOptions.PrimaryKeys[0].MemberId)!.Name;
        var fkName = model.GetMember(entityRefMember.FKMemberIds[0])!.Name;

        Purpose = QueryPurpose.ToTreePath;
        this.AddSelectItem(new SqlSelectItemExpression(T.F(pkName), "Id"));
        this.AddSelectItem(new SqlSelectItemExpression(T.F(fkName), "ParentId"));
        this.AddSelectItem(new SqlSelectItemExpression(textMember(T), "Text"));

        //开始执行查询并转换
        var db = SqlStore.Get(model.SqlStoreOptions!.StoreModelId);
        await using var cmd = db.BuildQuery(this);
        await using var conn = await db.OpenConnectionAsync();
        cmd.Connection = conn;
        Logger.Debug(cmd.CommandText);

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
    private static TEntity FindParent(EntityRefMember parentMember, TEntity entity, List<TEntity> from)
    {
        var model = parentMember.Owner;
        var pks = model.SqlStoreOptions!.PrimaryKeys;
        var memberValueGetter = new EntityMemberValueGetter();
        for (var i = from.Count - 1; i >= 0; i--) //倒查
        {
            var allSame = true;
            for (var j = 0; j < parentMember.FKMemberIds.Length; j++)
            {
                entity.WriteMember(parentMember.FKMemberIds[j], ref memberValueGetter,
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

    #endregion

    #region ====AsXXX Methods====

    public SqlSubQuery AsSubQuery(Func<EntityExpression, Expression> select)
    {
        this.AddSelectItem(new SqlSelectItemExpression(select(T)));
        return new SqlSubQuery(this);
    }

    #endregion

    #region ====Where Methods====

    public SqlQuery<TEntity> Where(Func<EntityExpression, Expression> condition)
    {
        Filter = condition(T);
        return this;
    }

    public SqlQuery<TEntity> Where(ISqlJoinable join, Func<EntityExpression, ISqlJoinable, Expression> condition)
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
        SortItems.Add(new SqlOrderBy(sortItem(T)));
        return this;
    }

    public SqlQuery<TEntity> OrderByDesc(Func<EntityExpression, Expression> sortItem)
    {
        SortItems.Add(new SqlOrderBy(sortItem(T), true));
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