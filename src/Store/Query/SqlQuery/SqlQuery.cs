using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Threading.Tasks;
using AppBoxCore;

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

    /// <summary>
    /// 筛选器
    /// </summary>
    public Expression? Filter { get; private set; }

    /// <summary>
    /// 用于EagerLoad导航属性 
    /// </summary>
    private SqlIncluder? _rootIncluder;

    public IList<SqlSelectItemExpression>? Selects
        => _selects ??= new List<SqlSelectItemExpression>();

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

    public SqlSelectItemExpression[]? GroupByKeys { get; private set; }

    public Expression? HavingFilter { get; private set; }

    #endregion

    #endregion

    #region ====Top & Page & Distinct Methods====

    public SqlQuery<TEntity> Take(int rows)
    {
        TakeSize = rows;
        return this;
    }

    public SqlQuery<TEntity> Skip(int rows)
    {
        SkipSize = rows;
        return this;
    }

    // public SqlQuery<TEntity>  Page(int pageSize, int pageIndex) //TODO:remove it
    // {
    //     TakeSize = pageSize;
    //     SkipSize = pageIndex * pageSize;
    //     return this;
    // }

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
            if (members[i].Type == EntityMemberType.DataField
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

    // public async Task<Entity> ToSingleAsync()
    // {
    //     Purpose = QueryPurpose.ToSingleEntity;
    //
    //     //添加选择项
    //     var model = await RuntimeContext.Current.GetModelAsync<EntityModel>(T.ModelID);
    //     AddAllSelects(this, model, T, null);
    //     if (_rootIncluder != null)
    //         await _rootIncluder.AddSelects(this, model);
    //
    //     //递交查询
    //     var db = SqlStore.Get(model.SqlStoreOptions.StoreModelId);
    //     var cmd = db.BuildQuery(this);
    //     using var conn = db.MakeConnection();
    //     await conn.OpenAsync();
    //     cmd.Connection = conn;
    //     Log.Debug(cmd.CommandText);
    //
    //     using var reader = await cmd.ExecuteReaderAsync();
    //     Entity res = null;
    //     if (await reader.ReadAsync())
    //     {
    //         res = FillEntity(model, reader);
    //     }
    //
    //     if (_rootIncluder != null)
    //         await _rootIncluder.LoadEntitySets(db, res, null); //TODO:fix txn
    //     return res;
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

    public async Task<IList<TEntity>> ToListAsync()
    {
        Purpose = QueryPurpose.ToList;
        var model = await RuntimeContext.GetModelAsync<EntityModel>(T.ModelID);

        //添加选择项,暂默认*
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
            FillEntity(entity, model, reader, 0);
            list.Add(entity);
        }

        // if (_rootIncluder != null && list != null)
        //     await _rootIncluder.LoadEntitySets(db, list, null); //TODO: ***** fix txn
        return list;
    }

    public async Task<IList<TEntity>> ToTreeAsync(
        Func<EntityExpression, EntityPathExpression> childrenMember)
    {
        Purpose = QueryPurpose.ToTree;
        var children = (EntitySetExpression)childrenMember(this.T);
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
                var condition = T[model.GetMember(fk)!.Name] == new PrimitiveExpression(null);
                AndWhere(condition);
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
            FillEntity(entity, model, reader, 0);

            var treeLevel = reader.GetInt32(reader.FieldCount - 1);
            if (treeLevel == 0)
            {
                list.Add(entity);
            }
            else
            {
                var parent = FindParent(TreeParentMember, entity, allList);
                //set child.Parent = parent
                SetParent(TreeParentMember, parent, entity);
                //add child to parent.children list
                var childrenList =
                    (IList<TEntity>)GetNaviPropForFetch(parent, childrenModel.MemberId);
                childrenList.Add(entity);
            }

            allList.Add(entity);
        }

        allList.Clear();
        return list;
    }

    private static void FillEntity(SqlEntity entity, EntityModel model, DbDataReader row,
        int extendsFlag)
    {
        //填充实体成员
        for (var i = 0; i < row.FieldCount - extendsFlag; i++)
        {
            FillMember(model, entity, row.GetName(i), row, i);
        }

        //需要改变实体持久化状态
        entity.FetchDone();
    }

    private static void FillMember(EntityModel model, SqlEntity entity, string path,
        DbDataReader row, int clIndex)
    {
        if (row.IsDBNull(clIndex)) return;

        var indexOfDot = path.IndexOf('.');
        if (indexOfDot < 0)
        {
            var member = model.GetMember(path, false);
            if (member == null)
            {
                //不存在通过反射处理, 如扩展的引用字段
                Log.Warn($"未找到实体成员{model.Name}.{path}");
            }
            else
            {
                var reader = new SqlRowReader(row);
                entity.ReadMember(member.MemberId, reader, clIndex);
            }
        }
        else
        {
            throw new NotImplementedException();
        }
    }

    /// <summary>
    /// 用于树状结构填充时查找指定实体的上级
    /// </summary>
    private static TEntity FindParent(EntityRefModel parentModel, TEntity entity,
        IList<TEntity> from)
    {
        var model = parentModel.Owner;
        var pks = model.SqlStoreOptions!.PrimaryKeys;
        var memberValueGetter = EntityMemberValueGetter.ThreadInstance;
        for (var i = from.Count - 1; i >= 0; i--) //倒查
        {
            var allSame = true;
            for (var j = 0; j < parentModel.FKMemberIds.Length; j++)
            {
                entity.WriteMember(parentModel.FKMemberIds[j], memberValueGetter,
                    EntityMemberWriteFlags.None);
                var fkValue = memberValueGetter.Value;
                from[i].WriteMember(pks[j].MemberId, memberValueGetter,
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
    /// 用于树状结构填充时设置上级实例
    /// </summary>
    private static void SetParent(EntityRefModel parentModel, TEntity parent, TEntity child)
    {
        var memberValueSetter = EntityMemberValueSetter.ThreadInstance;
        memberValueSetter.Value = AnyValue.From(parent);
        child.ReadMember(parentModel.MemberId, memberValueSetter, EntityMemberWriteFlags.None);
    }

    /// <summary>
    /// 初始化实体的导航属性
    /// </summary>
    private static object GetNaviPropForFetch(SqlEntity entity, short naviMemberId)
    {
        // 先判断是否已初始化过
        var memberValueGetter = EntityMemberValueGetter.ThreadInstance;
        entity.WriteMember(naviMemberId, memberValueGetter, EntityMemberWriteFlags.None);
        if (!memberValueGetter.Value.IsEmpty)
            return memberValueGetter.Value.BoxedValue!;

        // 初始化导航属性
        var initiator = EntityNaviPropInitiator.ThreadInstance;
        entity.ReadMember(naviMemberId, initiator, EntityMemberWriteFlags.None);
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

    public SqlQuery<TEntity> Where(Expression condition)
    {
        Filter = condition;
        return this;
    }

    public SqlQuery<TEntity> AndWhere(Expression condition)
    {
        Filter = Expression.IsNull(Filter)
            ? condition
            : new BinaryExpression(Filter!, condition, BinaryOperatorType.AndAlso);
        return this;
    }

    public SqlQuery<TEntity> OrWhere(Expression condition)
    {
        Filter = Expression.IsNull(Filter)
            ? condition
            : new BinaryExpression(Filter!, condition, BinaryOperatorType.OrElse);
        return this;
    }

    #endregion

    #region ====OrderBy Methods====

    public SqlQuery<TEntity> OrderBy(Expression sortItem)
    {
        SortItems.Add(new SqlSortItem(sortItem, SortType.ASC));
        return this;
    }

    public SqlQuery<TEntity> OrderByDesc(Expression sortItem)
    {
        SortItems.Add(new SqlSortItem(sortItem, SortType.DESC));
        return this;
    }

    #endregion

    #region ====GroupBy Methods====

    // public SqlQuery GroupBy(params SqlSelectItem[] groupKeys)
    // {
    //     if (groupKeys == null || groupKeys.Length <= 0)
    //         throw new ArgumentException("must select some one");
    //
    //     GroupByKeys = new SqlSelectItemExpression[groupKeys.Length];
    //     for (int i = 0; i < GroupByKeys.Length; i++)
    //     {
    //         groupKeys[i].Target.Owner = this;
    //         GroupByKeys[i] = groupKeys[i].Target;
    //     }
    //
    //     return this;
    // }

    public SqlQuery<TEntity> Having(Expression condition)
    {
        HavingFilter = condition;
        return this;
    }

    #endregion
}