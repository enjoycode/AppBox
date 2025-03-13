using System.Collections.Generic;
using System.Data.Common;
using System.Diagnostics;
using System.Text;
using AppBoxCore;

namespace AppBoxStore;

internal sealed class BuildQueryContext
{
    public BuildQueryContext(DbCommand command, ISqlQuery root)
    {
        _command = command;
        _rootQuery = root;
        ((SqlQueryBase)_rootQuery).AliasName = "t";
        _queries.Add(root, new QueryInfo(root));
    }

    #region ====Properties & Fields====

    /// <summary>
    /// 根查询
    /// </summary>
    private readonly ISqlQuery _rootQuery;

    /// <summary>
    /// 当前正在处理的查询
    /// </summary>
    public ISqlQuery CurrentQuery = null!;

    public QueryInfo CurrentQueryInfo = null!;

    private readonly DbCommand _command;
    //internal bool IsBuildCTESelectItem;

    private int _queryIndex;

    /// <summary>
    /// 查询字典表
    /// </summary>
    private readonly Dictionary<ISqlQuery, QueryInfo> _queries = [];

    private Dictionary<SqlQueryBase, Dictionary<string, EntityExpression>>? _autoJoins;

    private Dictionary<SqlQueryBase, Dictionary<string, EntityExpression>> AutoJoins =>
        _autoJoins ??= new Dictionary<SqlQueryBase, Dictionary<string, EntityExpression>>();

    private int _parameterIndex;

    /// <summary>
    /// 参数字典表
    /// </summary>
    private readonly Dictionary<object, string> _parameters = [];

    #endregion

    #region ====Methods====

    public void SetBuildStep(BuildQueryStep step) => CurrentQueryInfo.BuildStep = step;

    public void Append(string sql) => CurrentQueryInfo.Out.Append(sql);

    public void Append(char ch) => CurrentQueryInfo.Out.Append(ch);

    public void AppendWithNameEscaper(string name) =>
        CurrentQueryInfo.Out.AppendWithNameEscaper(name, "\"");

    public void AppendFormat(string sql, params object[] para)
        => CurrentQueryInfo.Out.AppendFormat(sql, para);

    public void AppendLine() => CurrentQueryInfo.Out.AppendLine();

    public void AppendLine(string sql) => CurrentQueryInfo.Out.AppendLine(sql);

    public void RemoveLastChar()
    {
        var sb = CurrentQueryInfo.Out;
        sb.Remove(sb.Length - 1, 1);
    }

    /// <summary>
    /// 根据参数值获取查询参数名称
    /// </summary>
    /// <param name="value"></param>
    /// <returns></returns>
    public string GetParameterName(object value)
    {
        if (!_parameters.TryGetValue(value, out var paraName))
        {
            _parameterIndex += 1;
            paraName = $"p{_parameterIndex.ToString()}";
            _parameters.Add(value, paraName);

            var para = _command.CreateParameter();
            para.ParameterName = paraName;
            para.Value = value;
            if (value is string s)
                para.Size = s.Length;
            _command.Parameters.Add(para);
        }

        return paraName;
    }

    /// <summary>
    /// 仅用于DbParameter占位
    /// </summary>
    public string GetDbParameterName()
    {
        _parameterIndex += 1;
        var paraName = $"p{_parameterIndex.ToString()}";
        var para = _command.CreateParameter();
        para.ParameterName = paraName;
        _command.Parameters.Add(para);
        return paraName;
    }

    public void BeginBuildQuery(ISqlQuery query)
    {
        QueryInfo? qi;

        //尚未处理过，则新建相应的QueryInfo并加入字典表
        //注意：根查询在构造函数时已加入字典表
        if (!_queries.TryGetValue(query, out qi))
            qi = AddSubQuery(query);

        //设置上级的查询及相应的查询信息
        if (!ReferenceEquals(query, _rootQuery))
        {
            qi.ParentQuery = CurrentQuery;
            qi.ParentInfo = CurrentQueryInfo;
        }

        //设置当前的查询及相应的查询信息
        CurrentQuery = query;
        CurrentQueryInfo = qi;

        //添加手工联接
        LoopAddQueryJoins((SqlQueryBase)query);
    }

    public void EndBuildQuery(ISqlQuery query, bool cte = false)
    {
        //判断是否根查询
        if (ReferenceEquals(CurrentQuery, _rootQuery))
        {
            _command.CommandText = CurrentQueryInfo.GetCommandText(cte);
        }
        else
        {
            CurrentQueryInfo.EndBuildQuery();
            CurrentQuery = CurrentQueryInfo.ParentQuery;
            CurrentQueryInfo = CurrentQueryInfo.ParentInfo;
        }
    }

    /// <summary>
    /// 添加指定的子查询至查询字典表
    /// </summary>
    /// <param name="query"></param>
    /// <returns></returns>
    private QueryInfo AddSubQuery(ISqlQuery query)
    {
        //先判断是否已存在于手工Join里，如果不存在则需要设置别名
        var q = (SqlQueryBase)query;
        if (!AutoJoins.ContainsKey(q))
        {
            _queryIndex += 1;
            ((SqlQueryBase)query).AliasName = $"t{_queryIndex.ToString()}";
        }

        QueryInfo info = new QueryInfo(query, CurrentQueryInfo);
        _queries.Add(query, info);
        return info;
    }

    /// <summary>
    /// 获取查询的别名
    /// 如果上下文中尚未存在查询，则自动设置别名并加入查询字典表
    /// </summary>
    /// <param name="query"></param>
    /// <returns></returns>
    public string GetQueryAliasName(ISqlQuery query)
    {
        Debug.Assert(query != null);
        if (!_queries.TryGetValue(query, out _))
            /*qi =*/ AddSubQuery(query); // 添加时会设置别名

        return ((SqlQueryBase)query).AliasName;
    }

    private void LoopAddQueryJoins(SqlQueryBase query)
    {
        //判断是否已经生成别名
        if (string.IsNullOrEmpty(query.AliasName))
        {
            _queryIndex += 1;
            query.AliasName = $"t{_queryIndex.ToString()}";
        }

        //将当前查询加入自动联接字典表
        AutoJoins.Add(query, new Dictionary<string, EntityExpression>());

        if (query.HasJoins)
        {
            foreach (var item in query.Joins)
            {
                if (item.Right is SqlQueryJoin) //注意：子查询不具备自动联接
                    LoopAddQueryJoins((SqlQueryBase)item.Right);
                else
                    LoopAddSubQueryJoins((SqlSubQuery)item.Right);
            }
        }
    }

    private void LoopAddSubQueryJoins(SqlSubQuery query)
    {
        if (query.HasJoins)
        {
            foreach (var item in query.Joins)
            {
                if (item.Right is SqlQueryJoin) //注意：子查询不具备自动联接
                    LoopAddQueryJoins((SqlQueryBase)item.Right);
                else
                    LoopAddSubQueryJoins((SqlSubQuery)item.Right);
            }
        }
    }

    public string GetEntityRefAliasName(EntityExpression exp, SqlQueryBase query)
    {
        var path = exp.ToString();
        var ds = AutoJoins[query];

        if (!ds.TryGetValue(path, out var e))
        {
            ds.Add(path, exp);
            _queryIndex += 1;
            exp.AliasName = $"j{_queryIndex}";
            e = exp;
        }

        return e.AliasName!;
    }

    /// <summary>
    /// 用于生成EntityRef的自动Join
    /// </summary>
    public void BuildQueryAutoJoins(SqlQueryBase target)
    {
        if (!AutoJoins.TryGetValue(target, out var ds))
            return;

        foreach (var rq in ds.Values)
        {
            //Left Join "City" c ON c."Code" = t."CityCode"
            //eg: Customer.City的City
            var rqModel = RuntimeContext.GetModel<EntityModel>(rq.ModelId);
            //eg: Customer.City的Customer
            var rqOwnerModel = RuntimeContext.GetModel<EntityModel>(rq.Owner!.ModelId);
            AppendFormat(" Left Join \"{0}\" {1} On ",
                rqModel.SqlStoreOptions!.GetSqlTableName(false, null), rq.AliasName!);
            //Build ON Condition, other.pks == this.fks
            var rm = (EntityRefModel)rqOwnerModel.GetMember(rq.Name, true)!;
            for (var i = 0; i < rqModel.SqlStoreOptions.PrimaryKeys.Length; i++)
            {
                if (i != 0) Append(" And ");
                var pk = (EntityFieldModel)rqModel.GetMember(
                    rqModel.SqlStoreOptions.PrimaryKeys[i].MemberId, true)!;
                var fk = (EntityFieldModel)rqOwnerModel.GetMember(rm.FKMemberIds[i], true)!;
                AppendFormat("{0}.\"{1}\"={2}.\"{3}\"", rq.AliasName!, pk.SqlColName,
                    rq.Owner.AliasName!, fk.SqlColName);
            }
        }
    }

    #endregion
}

internal sealed class QueryInfo
{
    #region ====Properties====

    private readonly StringBuilder _sb;
    private readonly StringBuilder _sb2; //用于输出Where条件

    /// <summary>
    /// 当前正在处理的查询的步骤
    /// </summary>
    public BuildQueryStep BuildStep;

    public StringBuilder Out
    {
        get
        {
            if (BuildStep == BuildQueryStep.BuildWhere
                || BuildStep == BuildQueryStep.BuildOrderBy
                || BuildStep == BuildQueryStep.BuildSkipAndTake
                || BuildStep == BuildQueryStep.BuildPageTail)
                return _sb2;
            return _sb;
        }
    }

    // ReSharper disable once UnusedAutoPropertyAccessor.Global
    internal ISqlQuery Owner { get; }

    internal ISqlQuery ParentQuery { get; set; } = null!;

    internal QueryInfo ParentInfo { get; set; } = null!;

    #endregion

    #region ====ctor====

    /// <summary>
    /// 构造根查询信息
    /// </summary>
    public QueryInfo(ISqlQuery owner)
    {
        Owner = owner;
        _sb = StringBuilderCache.Acquire();
        _sb2 = StringBuilderCache.Acquire();
    }

    /// <summary>
    /// 构造子查询信息
    /// </summary>
    /// <param name="owner"></param>
    /// <param name="parentInfo"></param>
    public QueryInfo(ISqlQuery owner, QueryInfo parentInfo)
    {
        Owner = owner;
        _sb = parentInfo.BuildStep == BuildQueryStep.BuildWhere ? parentInfo._sb2 : parentInfo._sb;
        _sb2 = StringBuilderCache.Acquire();
    }

    #endregion

    #region ====Methods====

    internal void EndBuildQuery()
    {
        _sb.Append(StringBuilderCache.GetStringAndRelease(_sb2));
    }

    internal string GetCommandText(bool cte)
    {
        if (!cte)
            _sb.Append(StringBuilderCache.GetStringAndRelease(_sb2));
        return StringBuilderCache.GetStringAndRelease(_sb);
    }

    #endregion
}

internal enum BuildQueryStep : byte
{
    BuildSelect,
    BuildFrom,
    BuildJoin,
    BuildWhere,
    BuildGroupBy,
    BuildOrderBy,
    BuildUpdateSet,
    BuildUpsertSet,
    BuildWithCTE,
    BuildPageTail,
    BuildPageOrderBy,
    BuildSkipAndTake,
    BuildHaving,
}