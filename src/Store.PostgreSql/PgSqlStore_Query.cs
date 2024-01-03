using System;
using System.Collections;
using System.Collections.Generic;
using System.Data.Common;
using System.Text;
using AppBoxCore;
using Npgsql;

namespace AppBoxStore;

partial class PgSqlStore
{
    protected override DbCommand BuildQuery(ISqlSelectQuery query)
    {
        var cmd = new NpgsqlCommand();
        var ctx = new BuildQueryContext(cmd, query);

        switch (query.Purpose)
        {
            case QueryPurpose.ToTree:
                BuildTreeQuery(query, ctx);
                break;
            case QueryPurpose.ToTreePath:
                BuildTreePathQuery(query, ctx);
                break;
            default:
                BuildNormalQuery(query, ctx);
                break;
        }

        return cmd;
    }

    private void BuildNormalQuery(ISqlSelectQuery query, BuildQueryContext ctx)
    {
        //设置上下文
        ctx.BeginBuildQuery(query);

        //构建Select
        ctx.Append("Select ");
        if (query.Distinct) ctx.Append("Distinct ");

        //构建Select Items
        ctx.CurrentQueryInfo.BuildStep = BuildQueryStep.BuildSelect;
        if (query.Purpose == QueryPurpose.Count)
        {
            ctx.Append("Count(*)");
        }
        else
        {
            var selects = query.Selects;
            if (selects == null || selects.Count == 0)
            {
                ctx.Append(((SqlQueryBase)query).AliasName);
                ctx.Append(".*");
            }
            else
            {
                foreach (var si in selects)
                {
                    BuildSelectItem(si, ctx);
                    ctx.Append(',');
                }

                ctx.RemoveLastChar();
            }
        }

        //构建From
        ctx.CurrentQueryInfo.BuildStep = BuildQueryStep.BuildFrom;
        ctx.Append(" From ");
        //判断From源
        // if (query is SqlFromQuery)
        // {
        //     SqlFromQuery q = (SqlFromQuery)ctx.CurrentQuery;
        //     //开始构建From子查询
        //     ctx.Append("(");
        //     BuildNormalQuery(q.Target, ctx);
        //     ctx.Append(")");
        //     ctx.AppendFormat(" {0}",
        //         ((SqlQueryBase)q.Target).AliasName); // ((QueryBase)query).AliasName);
        // }
        // else
        // {
        var q = (ISqlEntityQuery)ctx.CurrentQuery;
        var model = RuntimeContext.GetModel<EntityModel>(q.T.ModelID);
        ctx.Append('"');
        ctx.Append(model.SqlStoreOptions!.GetSqlTableName(false, null));
        ctx.Append("\" ");
        ctx.Append(q.AliasName);
        // }

        //构建Where
        ctx.CurrentQueryInfo.BuildStep = BuildQueryStep.BuildWhere;
        if (!Equals(null, ctx.CurrentQuery.Filter))
        {
            ctx.Append(" Where ");
            BuildExpression(ctx.CurrentQuery.Filter, ctx);
        }

        //非分组的情况下构建Order By
        if (query.Purpose != QueryPurpose.Count)
        {
            if (query.GroupByKeys == null && query.HasSortItems)
            {
                ctx.CurrentQueryInfo.BuildStep = BuildQueryStep.BuildOrderBy;
                BuildOrderBy(query, ctx);
            }
        }

        //构建Join
        ctx.CurrentQueryInfo.BuildStep = BuildQueryStep.BuildJoin;
        var q1 = (SqlQueryBase)ctx.CurrentQuery;
        if (q1.HasJoins) //先处理每个手工的联接及每个手工联接相应的自动联接
        {
            BuildJoins(q1.Joins, ctx);
        }

        ctx.BuildQueryAutoJoins(q1); //再处理自动联接

        //处理Skip and Take
        if (query.Purpose != QueryPurpose.Count)
        {
            ctx.CurrentQueryInfo.BuildStep = BuildQueryStep.BuildSkipAndTake;
            if (query.SkipSize > 0)
                ctx.AppendFormat(" Offset {0}", query.SkipSize);
            if (query.Purpose == QueryPurpose.ToSingle)
                ctx.Append(" Limit 1 ");
            else if (query.TakeSize > 0)
                ctx.AppendFormat(" Limit {0} ", query.TakeSize);
        }

        //构建分组、Having及排序
        BuildGroupBy(query, ctx);

        //结束上下文
        ctx.EndBuildQuery(query);
    }

    //With RECURSIVE cte
    //("ID","BaseID","BaseType","ParentID","ManagerID","SortNumber","Disabled","TreeLevel")
    //As
    //(Select t."ID", t."BaseID", t."BaseType", t."ParentID", t."ManagerID", t."SortNumber", t."Disabled",0 
    //From "sys.OrgUnit" As t
    //Where t."ParentID" ISNULL
    //Union All
    //Select t."ID", t."BaseID", t."BaseType", t."ParentID", t."ManagerID", t."SortNumber", t."Disabled","TreeLevel" + 1 
    //From "sys.OrgUnit" As t Inner Join cte as d On t."ParentID" = d."ID")
    //Select t."ID" "t.ID", t."BaseID" "t.BaseID", t."BaseType" "t.BaseType", t."ParentID" "t.ParentID", t."ManagerID" 
    //"t.ManagerID", t."SortNumber" "t.SortNumber", t."Disabled" "t.Disabled" From cte t
    //Order By t."TreeLevel", t."SortNumber"

    private void BuildTreeQuery(ISqlSelectQuery query, BuildQueryContext ctx)
    {
        //设置上下文
        ctx.BeginBuildQuery(query);

        ctx.Append("With RECURSIVE cte (");
        ctx.SetBuildStep(BuildQueryStep.BuildWithCTE);
        foreach (var si in query.Selects!)
        {
            if (si.Expression is EntityFieldExpression fsi && Expression.IsNull(fsi.Owner!.Owner))
            {
                ctx.AppendWithNameEscaper(fsi.Name!);
                ctx.Append(',');
            }
        }

        ctx.Append(TREE_LEVEL);
        ctx.Append(") As (Select ");
        //Select Anchor
        ctx.SetBuildStep(BuildQueryStep.BuildSelect);
        BuildCTE_SelectItems(query, ctx);
        ctx.Append("0 From ");

        //From Anchor
        ctx.SetBuildStep(BuildQueryStep.BuildFrom);
        var q = (ISqlEntityQuery)query;
        var model = RuntimeContext.GetModel<EntityModel>(q.T.ModelID);
        ctx.AppendWithNameEscaper(model.SqlStoreOptions!.GetSqlTableName(false, null));
        ctx.Append(" AS ");
        ctx.Append(q.AliasName);

        //Where Anchor
        ctx.SetBuildStep(BuildQueryStep.BuildWhere);
        if (!Expression.IsNull(query.Filter))
        {
            ctx.Append(" Where ");
            BuildExpression(query.Filter!, ctx);
        }

        //End 1
        ctx.CurrentQueryInfo.EndBuidQuery();

        //Union all
        ctx.SetBuildStep(BuildQueryStep.BuildSelect);
        ctx.Append(" Union All Select ");

        //Select 2
        //ctx.SetBuildStep(BuildQueryStep.BuildSelect);
        BuildCTE_SelectItems(query, ctx);
        ctx.Append(TREE_LEVEL);
        ctx.Append("+1 From ");

        //From 2
        ctx.SetBuildStep(BuildQueryStep.BuildFrom);
        ctx.AppendWithNameEscaper(model.SqlStoreOptions.GetSqlTableName(false, null));
        ctx.Append(" AS ");
        ctx.Append(q.AliasName);

        //Inner Join 
        ctx.Append(" Inner Join cte as d On ");
        var treeParentMember = q.TreeParentMember!;
        for (var i = 0; i < treeParentMember.FKMemberIds.Length; i++)
        {
            if (i != 0) ctx.Append(" And ");

            var fkName = model.GetMember(treeParentMember.FKMemberIds[i])!.Name;
            var pkName = model.GetMember(model.SqlStoreOptions!.PrimaryKeys[i].MemberId)!.Name;
            BuildFieldExpression((EntityFieldExpression)q.T[fkName], ctx);
            ctx.Append("=d.");
            ctx.AppendWithNameEscaper(pkName);
        }

        ctx.Append(") Select t.* From cte t"); //需要tree_level用于判断层级

        //构建自动联接Join，主要用于继承的
        ctx.SetBuildStep(BuildQueryStep.BuildJoin);
        ctx.BuildQueryAutoJoins((SqlQueryBase)q); //再处理自动联接

        //最后处理Order By 
        ctx.SetBuildStep(BuildQueryStep.BuildOrderBy);
        if (query.HasSortItems)
        {
            ctx.Append(" Order By t.");
            ctx.Append(TREE_LEVEL);
            foreach (var item in query.SortItems)
            {
                ctx.Append(',');
                BuildExpression(item.Expression, ctx);
                if (item.SortType == SortType.DESC)
                    ctx.Append(" DESC");
            }
        }

        //End 1
        ctx.EndBuildQuery(query, true);
    }

    private void BuildTreePathQuery(ISqlSelectQuery query, BuildQueryContext ctx)
    {
        //设置上下文
        ctx.BeginBuildQuery(query);

        ctx.Append("With RECURSIVE cte (\"Id\",\"ParentId\",\"Text\",\"Level\") As (Select ");
        //Select Anchor
        ctx.SetBuildStep(BuildQueryStep.BuildSelect);
        BuildCTE_SelectItems(query, ctx, true);
        ctx.Append("0 From ");
        //From Anchor
        ctx.SetBuildStep(BuildQueryStep.BuildFrom);
        var q = (ISqlEntityQuery)query;
        var model = RuntimeContext.GetModel<EntityModel>(q.T.ModelID);
        ctx.AppendFormat("\"{0}\" As {1}", model.SqlStoreOptions!.GetSqlTableName(false, null), q.AliasName);
        //Where Anchor
        ctx.SetBuildStep(BuildQueryStep.BuildWhere);
        if (!Equals(null, query.Filter))
        {
            ctx.Append(" Where ");
            BuildExpression(query.Filter, ctx);
        }

        //End 1
        ctx.CurrentQueryInfo.EndBuidQuery(); //ctx.EndBuildQuery(query);

        //Union all
        ctx.SetBuildStep(BuildQueryStep.BuildSelect);
        ctx.Append(" Union All Select ");
        //Select 2
        BuildCTE_SelectItems(query, ctx, true);
        ctx.Append("\"Level\" + 1 From ");
        //From 2
        ctx.SetBuildStep(BuildQueryStep.BuildFrom);
        ctx.AppendFormat("\"{0}\" As {1}", model.SqlStoreOptions!.GetSqlTableName(false, null), q.AliasName);
        //Inner Join 
        ctx.Append(" Inner Join cte as d On d.\"ParentId\"=t.\"Id\") Select * From cte");

        //End 1
        ctx.EndBuildQuery(query, true);
    }

    private static void BuildCTE_SelectItems(ISqlSelectQuery query, BuildQueryContext ctx,
        bool forTeeNodePath = false)
    {
        //ctx.IsBuildCTESelectItem = true;
        foreach (var si in query.Selects!)
        {
            if (si.Expression is EntityFieldExpression fsi)
            {
                if (Expression.IsNull(fsi.Owner!.Owner))
                {
                    ctx.Append("t.");
                    ctx.AppendWithNameEscaper(fsi.Name!);
                    if (forTeeNodePath)
                    {
                        ctx.Append(' ');
                        ctx.AppendWithNameEscaper(si.AliasName!);
                    }

                    ctx.Append(',');
                }
            }
            //TODO: else if (forTeeNodePath)
            //{
            //    var aggRefField = si.Expression as AggregationRefFieldExpression;
            //    if (!object.Equals(null, aggRefField))
            //    {
            //        BuildAggregationRefFieldExpression(aggRefField, ctx);
            //        ctx.AppendFormat(" \"{0}\",", si.AliasName);
            //    }
            //}
        }
        //ctx.IsBuildCTESelectItem = false;
    }

    private void BuildOrderBy(ISqlSelectQuery query, BuildQueryContext ctx)
    {
        ctx.Append(" Order By ");
        for (int i = 0; i < query.SortItems.Count; i++)
        {
            SqlSortItem si = query.SortItems[i];
            BuildExpression(si.Expression, ctx);
            if (si.SortType == SortType.DESC)
                ctx.Append(" DESC");
            if (i < query.SortItems.Count - 1)
                ctx.Append(" ,");
        }
    }

    private void BuildGroupBy(ISqlSelectQuery query, BuildQueryContext ctx)
    {
        if (query.GroupByKeys == null || query.GroupByKeys.Count == 0)
            return;

        ctx.CurrentQueryInfo.BuildStep = BuildQueryStep.BuildGroupBy;
        ctx.Append(" Group By ");
        for (int i = 0; i < query.GroupByKeys.Count; i++)
        {
            if (i != 0) ctx.Append(",");
            BuildExpression(query.GroupByKeys[i], ctx);
        }

        if (!Expression.IsNull(query.HavingFilter))
        {
            ctx.CurrentQueryInfo.BuildStep = BuildQueryStep.BuildHaving;
            ctx.Append(" Having ");
            BuildExpression(query.HavingFilter!, ctx);
        }

        if (query.HasSortItems)
        {
            ctx.CurrentQueryInfo.BuildStep = BuildQueryStep.BuildOrderBy;
            BuildOrderBy(query, ctx);
        }
    }

    private void BuildSelectItem(SqlSelectItemExpression item, BuildQueryContext ctx)
    {
        //判断item.Expression是否是子Select项,是则表示外部查询（FromQuery）引用的Select项
        if (item.Expression.Type == ExpressionType.SelectItemExpression)
        {
            SqlSelectItemExpression si = (SqlSelectItemExpression)item.Expression;
            //判断当前查询是否等于Select项的所有者，否则表示Select项的所有者的外部查询引用该Select项
            if (ReferenceEquals(ctx.CurrentQuery, item.Owner))
                ctx.AppendFormat("{0}.\"{1}\"", ctx.GetQueryAliasName(si.Owner), si.AliasName);
            else
                ctx.AppendFormat("{0}.\"{1}\"", ctx.GetQueryAliasName(item.Owner), si.AliasName);

            //处理选择项别名
            if (ctx.CurrentQueryInfo.BuildStep ==
                BuildQueryStep.BuildSelect) //&& !ctx.IsBuildCTESelectItem)
            {
                if (item.AliasName != si.AliasName)
                    ctx.AppendFormat(" \"{0}\"", item.AliasName);
            }
        }
        else //----上面为FromQuery的Select项，下面为Query或SubQuery的Select项----
        {
            //判断当前查询是否等于Select项的所有者，否则表示Select项的所有者的外部查询引用该Select项
            if (ReferenceEquals(ctx.CurrentQuery, item.Owner))
                BuildExpression(item.Expression, ctx);
            else
                ctx.AppendFormat("{0}.\"{1}\"", ctx.GetQueryAliasName(item.Owner), item.AliasName);

            //处理选择项别名
            if (ctx.CurrentQueryInfo.BuildStep ==
                BuildQueryStep.BuildSelect) //&& !ctx.IsBuildCTESelectItem)
            {
                var memberExp = item.Expression as EntityPathExpression;
                if (Expression.IsNull(memberExp)
                    /*|| memberExp.Type == ExpressionType.AggregationRefFieldExpression*/
                    //注意：聚合引用字段必须用别名
                    || memberExp.Name != item.AliasName)
                {
                    ctx.AppendFormat(" \"{0}\"", item.AliasName);
                }
            }
        }
    }

    /// <summary>
    /// 处理手工联接及其对应的自动联接
    /// </summary>
    private void BuildJoins(IList<SqlJoin> joins, BuildQueryContext ctx)
    {
        foreach (var item in joins)
        {
            //先处理当前的联接
            ctx.Append(GetJoinString(item.JoinType));
            if (item.Right is SqlQueryJoin j)
            {
                var jModel = RuntimeContext.GetModel<EntityModel>(j.T.ModelID);
                ctx.AppendFormat("\"{0}\" {1} On ", jModel.SqlStoreOptions!.GetSqlTableName(false, null),
                    j.AliasName);
                BuildExpression(item.OnConditon, ctx);

                //再处理手工联接的自动联接
                ctx.BuildQueryAutoJoins(j);
            }
            else //否则表示联接对象是SubQuery，注意：子查询没有自动联接
            {
                SqlSubQuery sq = (SqlSubQuery)item.Right;
                ctx.Append("(");
                BuildNormalQuery(sq.Target, ctx);
                ctx.AppendFormat(") As {0} On ", ((SqlQueryBase)sq.Target).AliasName);
                BuildExpression(item.OnConditon, ctx);
            }

            //最后递归当前联接的右部是否还有手工的联接项
            if (item.Right.HasJoins)
                BuildJoins(item.Right.Joins, ctx);
        }
    }

    #region ====Build Expression Methods====

    private void BuildExpression(Expression exp, BuildQueryContext ctx)
    {
        switch (exp.Type)
        {
            case ExpressionType.EntityFieldExpression:
                BuildFieldExpression((EntityFieldExpression)exp, ctx);
                break;
            case ExpressionType.EntityExpression:
                BuildEntityExpression((EntityExpression)exp, ctx);
                break;
            //case ExpressionType.AggregationRefFieldExpression:
            //    BuildAggregationRefFieldExpression((AggregationRefFieldExpression)exp, ctx);
            //    break;
            case ExpressionType.BinaryExpression:
                BuildBinaryExpression((BinaryExpression)exp, ctx);
                break;
            case ExpressionType.ConstantExpression:
                BuildPrimitiveExpression((ConstantExpression)exp, ctx);
                break;
            case ExpressionType.SelectItemExpression:
                BuildSelectItem((SqlSelectItemExpression)exp, ctx);
                break;
            // case ExpressionType.SubQueryExpression:
            //     BuildSubQuery((SqlSubQuery)exp, ctx);
            //     break;
            case ExpressionType.DbFuncExpression:
                BuidDbFuncExpression((SqlFunc)exp, ctx);
                break;
            // case ExpressionType.DbParameterExpression:
            //     BuildDbParameterExpression((DbParameterExpression)exp, ctx);
            //     break;
            //case ExpressionType.InvocationExpression:
            //    BuildInvocationExpression((InvocationExpression)exp, ctx);
            //    break;
            default:
                throw new NotSupportedException($"Not Supported Expression Type [{exp.Type.ToString()}] for Query.");
        }
    }

    // private void BuildSubQuery(SqlSubQuery exp, BuildQueryContext ctx)
    // {
    //     ctx.Append("(");
    //     BuildNormalQuery(exp.Target, ctx);
    //     ctx.Append(")");
    // }

    private void BuildPrimitiveExpression(ConstantExpression exp, BuildQueryContext ctx)
    {
        if (exp.Value == null)
        {
            ctx.Append("NULL");
            return;
        }

        if (exp.Value is IEnumerable list && !(exp.Value is string)) //用于处理In及NotIn的参数
        {
            ctx.Append("(");
            bool first = true;
            foreach (var item in list)
            {
                if (first) first = false;
                else ctx.Append(",");
                ctx.AppendFormat("@{0}", ctx.GetParameterName(item));
            }

            ctx.Append(")");
        }
        else
        {
            if (exp.Value is ulong v)
                ctx.AppendFormat("@{0}", ctx.GetParameterName(unchecked((long)v)));
            else
                ctx.AppendFormat("@{0}", ctx.GetParameterName(exp.Value));
        }
    }

    private void BuildEntityExpression(EntityExpression exp, BuildQueryContext ctx)
    {
        //判断是否已处理过
        if (exp.AliasName != null)
            return;

        //处理EntityExpression的IsInDesign属性，全部更改为非设计状态
        //因为客户端模型设计器保存的表达式是设计状态的
        //exp.SetNotInDesignForBuildQuery();

        //判断是否已到达根
        if (Equals(null, exp.Owner))
        {
            //判断exp.User是否为Null，因为可能是附加的QuerySelectItem
            if (exp.User == null)
            {
                SqlQueryBase q = ctx.CurrentQuery as SqlQueryBase;
                exp.User = q ?? throw new Exception("NpgsqlCommandHelper.BuildEntityExpression()");
            }

            exp.AliasName = ((SqlQueryBase)exp.User).AliasName;
        }
        else //否则表示自动联接
        {
            //先处理Owner
            BuildEntityExpression(exp.Owner, ctx);
            //再获取自动联接的别名
            exp.AliasName = ctx.GetEntityRefAliasName(exp, (SqlQueryBase)exp.User);
        }
    }

    private void BuildFieldExpression(EntityFieldExpression exp, BuildQueryContext ctx)
    {
        var model = RuntimeContext.GetModel<EntityModel>(exp.Owner!.ModelID);

        //判断上下文是否在处理Update的Set
        if (ctx.CurrentQueryInfo.BuildStep == BuildQueryStep.BuildUpdateSet)
            ctx.AppendFormat("\"{0}\"", exp.Name);
        else if (ctx.CurrentQueryInfo.BuildStep == BuildQueryStep.BuildUpsertSet)
            ctx.AppendFormat("\"{0}\".\"{1}\"", model.Name, exp.Name);
        else
        {
            BuildEntityExpression(exp.Owner, ctx);
            ctx.AppendFormat("{0}.\"{1}\"", exp.Owner.AliasName, exp.Name);
        }
    }

    private void BuildBinaryExpression(BinaryExpression exp, BuildQueryContext ctx)
    {
        //左操作数
        BuildExpression(exp.LeftOperand, ctx);

        //判断是否在处理条件中
        if (exp.RightOperand.Type == ExpressionType.ConstantExpression
            && ((ConstantExpression)exp.RightOperand).Value == null
            && ctx.CurrentQueryInfo.BuildStep == BuildQueryStep.BuildWhere)
        {
            if (exp.BinaryType == BinaryOperatorType.Equal)
                ctx.Append(" ISNULL");
            else if (exp.BinaryType == BinaryOperatorType.NotEqual)
                ctx.Append(" NOTNULL");
            else
                throw new Exception("BuildBinaryExpression Error.");
        }
        else
        {
            //操作符
            BuildBinaryOperatorType(exp, ctx.CurrentQueryInfo.Out);
            //右操作数
            //暂在这里特殊处理Like通配符
            if (exp.BinaryType == BinaryOperatorType.Like &&
                exp.RightOperand is ConstantExpression pattern)
            {
                ctx.AppendFormat("@{0}", ctx.GetParameterName($"%{pattern.Value}%"));
            }
            else
            {
                BuildExpression(exp.RightOperand, ctx);
            }
        }
    }

    private void BuidDbFuncExpression(SqlFunc exp, BuildQueryContext ctx)
    {
        ctx.Append($"{exp.Name}(");
        if (exp.Arguments != null)
        {
            for (var i = 0; i < exp.Arguments.Length; i++)
            {
                if (i != 0) ctx.Append(",");
                BuildExpression(exp.Arguments[i], ctx);
            }
        }

        ctx.Append(')');
    }

    // private void BuildDbParameterExpression(DbParameterExpression exp, BuildQueryContext ctx)
    // {
    //     ctx.AppendFormat("@{0}", ctx.GetDbParameterName());
    // }

    #endregion

    #region ====private static help methods====

    private static string GetJoinString(JoinType joinType)
    {
        return joinType switch
        {
            JoinType.InnerJoin => " Join ",
            JoinType.LeftJoin => " Left Join ",
            JoinType.RightJoin => " Right Join ",
            JoinType.FullJoin => " Full Join ",
            _ => throw new NotSupportedException(),
        };
    }

    private static void BuildBinaryOperatorType(BinaryExpression exp, StringBuilder sb)
    {
        switch (exp.BinaryType)
        {
            case BinaryOperatorType.AndAlso:
                sb.Append(" And ");
                break;
            case BinaryOperatorType.OrElse:
                sb.Append(" Or ");
                break;
            case BinaryOperatorType.BitwiseAnd:
                sb.Append(" & ");
                break;
            case BinaryOperatorType.BitwiseOr:
                sb.Append(" | ");
                break;
            case BinaryOperatorType.BitwiseXor:
                sb.Append(" ^ ");
                break;
            case BinaryOperatorType.Divide:
                sb.Append(" / ");
                break;
            case BinaryOperatorType.Assign:
            case BinaryOperatorType.Equal:
                sb.Append(" = ");
                break;
            case BinaryOperatorType.Greater:
                sb.Append(" > ");
                break;
            case BinaryOperatorType.GreaterOrEqual:
                sb.Append(" >= ");
                break;
            case BinaryOperatorType.In:
                sb.Append(" In ");
                break;
            case BinaryOperatorType.NotIn:
                sb.Append(" Not In ");
                break;
            case BinaryOperatorType.Is:
                sb.Append(" Is ");
                break;
            case BinaryOperatorType.IsNot:
                sb.Append(" Is Not ");
                break;
            case BinaryOperatorType.Less:
                sb.Append(" < ");
                break;
            case BinaryOperatorType.LessOrEqual:
                sb.Append(" <= ");
                break;
            case BinaryOperatorType.Like:
                sb.Append(" Like ");
                break;
            case BinaryOperatorType.Minus:
                sb.Append(" - ");
                break;
            case BinaryOperatorType.Modulo:
                break;
            case BinaryOperatorType.Multiply:
                sb.Append(" * ");
                break;
            case BinaryOperatorType.NotEqual:
                sb.Append(" <> ");
                break;
            case BinaryOperatorType.Plus:
                if (CheckNeedConvertStringAddOperator(exp))
                    sb.Append(" || ");
                else
                    sb.Append(" + ");
                break;
            default:
                throw new NotSupportedException();
        }
    }

    /// <summary>
    /// 用于字符串+连接时转换为||操作符
    /// </summary>
    /// <returns>true需要转换</returns>
    private static bool CheckNeedConvertStringAddOperator(Expression exp)
    {
        switch (exp.Type)
        {
            case ExpressionType.BinaryExpression:
            {
                var e = (BinaryExpression)exp;
                return CheckNeedConvertStringAddOperator(e.LeftOperand)
                       || CheckNeedConvertStringAddOperator(e.RightOperand);
            }
            case ExpressionType.EntityFieldExpression:
            {
                var e = (EntityFieldExpression)exp;
                var model = RuntimeContext.GetModel<EntityModel>(e.Owner.ModelID);
                var fieldModel = (EntityFieldModel)model.GetMember(e.Name, true);
                return fieldModel.FieldType == EntityFieldType.String;
            }
            case ExpressionType.ConstantExpression:
                return ((ConstantExpression)exp).Value is string;
            //case ExpressionType.InvocationExpression:
            //    throw new NotImplementedException(); //TODO:根据系统函数判断
            default:
                throw new NotSupportedException("Not Supported Expression Type ["
                                                + exp.Type.ToString() +
                                                "] for CheckNeedConvertStringAddOperator.");
        }
    }

    #endregion
}