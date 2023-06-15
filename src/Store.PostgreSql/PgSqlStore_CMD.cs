using System.Data.Common;
using AppBoxCore;
using Npgsql;

namespace AppBoxStore;

partial class PgSqlStore
{
    protected override DbCommand BuildUpdateCommand(SqlUpdateCommand updateCommand, EntityModel model)
    {
        var cmd = new NpgsqlCommand();
        var ctx = new BuildQueryContext(cmd, updateCommand);
        //设置上下文
        ctx.BeginBuildQuery(updateCommand);

        ctx.AppendFormat("Update \"{0}\" t Set ", model.SqlStoreOptions!.GetSqlTableName(false, null));
        ctx.CurrentQueryInfo.BuildStep = BuildQueryStep.BuildUpdateSet;
        for (var i = 0; i < updateCommand.UpdateItems.Count; i++)
        {
            BuildExpression(updateCommand.UpdateItems[i], ctx);
            if (i < updateCommand.UpdateItems.Count - 1)
                ctx.Append(",");
        }

        //构建Where
        ctx.CurrentQueryInfo.BuildStep = BuildQueryStep.BuildWhere;
        if (!Expression.IsNull(updateCommand.Filter))
        {
            ctx.Append(" Where ");
            BuildExpression(ctx.CurrentQuery.Filter!, ctx);
        }

        //构建Join
        ctx.CurrentQueryInfo.BuildStep = BuildQueryStep.BuildJoin;
        SqlQueryBase q1 = (SqlQueryBase)ctx.CurrentQuery;
        if (q1.HasJoins) //先处理每个手工的联接及每个手工联接相应的自动联接
        {
            BuildJoins(q1.Joins, ctx);
        }

        ctx.BuildQueryAutoJoins(q1); //再处理自动联接

        //最后处理返回值
        if (updateCommand.OutputItems != null)
        {
            ctx.CurrentQueryInfo.BuildStep = BuildQueryStep.BuildWhere; //TODO: fix this?
            ctx.Append(" RETURNING ");
            for (var i = 0; i < updateCommand.OutputItems.Length; i++)
            {
                var field = (EntityFieldExpression)updateCommand.OutputItems[i];
                ctx.AppendFormat("\"{0}\"", field.Name!);
                if (i != updateCommand.OutputItems.Length - 1)
                    ctx.Append(",");
            }
        }

        //结束用于附加条件，注意：仅在Upsert时这样操作
        ctx.EndBuildQuery(updateCommand);
        return cmd;
    }

    protected override DbCommand BuildDeleteCommand(SqlDeleteCommand deleteCommand, EntityModel model)
    {
        var cmd = new NpgsqlCommand();
        var ctx = new BuildQueryContext(cmd, deleteCommand);
        //设置上下文
        ctx.BeginBuildQuery(deleteCommand);

        ctx.AppendFormat("Delete From \"{0}\" t ", model.SqlStoreOptions!.GetSqlTableName(false, null));

        //构建Where
        ctx.CurrentQueryInfo.BuildStep = BuildQueryStep.BuildWhere;
        if (!Expression.IsNull(deleteCommand.Filter))
        {
            ctx.Append(" Where ");
            BuildExpression(ctx.CurrentQuery.Filter!, ctx);
        }

        //构建Join
        ctx.CurrentQueryInfo.BuildStep = BuildQueryStep.BuildJoin;
        var q1 = (SqlQueryBase)ctx.CurrentQuery;
        if (q1.HasJoins) //先处理每个手工的联接及每个手工联接相应的自动联接
        {
            BuildJoins(q1.Joins, ctx);
        }

        ctx.BuildQueryAutoJoins(q1); //再处理自动联接

        ctx.EndBuildQuery(deleteCommand);
        return cmd;
    }
}