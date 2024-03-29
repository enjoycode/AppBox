using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Diagnostics;
using System.Linq;
using System.Text;
using AppBoxCore;
using Npgsql;

namespace AppBoxStore;

partial class PgSqlStore
{
    protected override IList<DbCommand> MakeCreateTable(EntityModel model, IModelContainer ctx)
    {
        var tableName = model.SqlStoreOptions!.GetSqlTableName(false, ctx);
        //var funcCmds = new List<DbCommand>();
        var fks = new List<string>(); //引用外键集合

        var sb = StringBuilderCache.Acquire();
        //Build Create Table
        sb.Append($"CREATE TABLE \"{tableName}\" (");
        foreach (var mm in model.Members)
        {
            if (mm.Type == EntityMemberType.EntityField)
            {
                BuildFieldDefine((EntityFieldModel)mm, sb, false);
                sb.Append(',');
            }
            else if (mm.Type == EntityMemberType.EntityRef)
            {
                var rm = (EntityRefModel)mm;
                if (!rm.IsAggregationRef) //只有非聚合引合创建外键
                {
                    fks.Add(BuildForeignKey(rm, ctx, tableName));
                    //考虑旧实现CreateGetTreeNodeChildsDbFuncCommand
                }
            }
        }

        sb.Remove(sb.Length - 1, 1);
        sb.Append(");");

        //Build PrimaryKey
        if (model.SqlStoreOptions!.HasPrimaryKeys)
        {
            sb.AppendLine();
            BuildPrimaryKey(model, tableName, sb, false);
        }

        //加入EntityRef引用外键
        sb.AppendLine();
        for (var i = 0; i < fks.Count; i++)
        {
            sb.AppendLine(fks[i]);
        }

        var res = new List<DbCommand> { new NpgsqlCommand(StringBuilderCache.GetStringAndRelease(sb)) };

        //Build Indexes
        BuildIndexes(model, res, tableName);

        return res;
    }

    protected override IList<DbCommand> MakeAlterTable(EntityModel model, IModelContainer ctx)
    {
        var tableName = model.SqlStoreOptions!.GetSqlTableName(false, ctx);

        var needCommand = false; //用于判断是否需要处理NpgsqlCommand
        var foreignKeys = new List<string>(); //引用外键列表
        var commands = new List<DbCommand>();
        //List<DbCommand> funcCmds = new List<DbCommand>();
        //先处理表名称有没有变更，后续全部使用新名称
        if (model.SqlStoreOptions.IsTableNameChanged) //TODO:应判断存储选项的表名称是否改变
        {
            var oldTableName = model.SqlStoreOptions!.GetSqlTableName(true, ctx);
            var renameTableCmd = new NpgsqlCommand($"ALTER TABLE \"{oldTableName}\" RENAME TO \"{tableName}\"");
            commands.Add(renameTableCmd);
        }

        //处理删除的成员
        var deletedMembers = model.Members
            .Where(t => t.PersistentState == PersistentState.Deleted)
            .ToArray();
        if (deletedMembers.Length > 0)
        {
            #region ----删除的成员----

            var sb = StringBuilderCache.Acquire();
            foreach (var m in deletedMembers)
            {
                if (m.Type == EntityMemberType.EntityField)
                {
                    needCommand = true;
                    sb.AppendFormat("ALTER TABLE \"{0}\" DROP COLUMN \"{1}\";", tableName,
                        ((EntityFieldModel)m).SqlColOriginalName);
                }
                else if (m.Type == EntityMemberType.EntityRef)
                {
                    EntityRefModel rm = (EntityRefModel)m;
                    if (!rm.IsAggregationRef)
                    {
                        var fkName = $"FK_{rm.Owner.Id}_{rm.MemberId}"; //TODO:特殊处理DbFirst导入表的外键约束名称
                        foreignKeys.Add($"ALTER TABLE \"{tableName}\" DROP CONSTRAINT \"{fkName}\";");
                    }
                }
            }

            if (needCommand)
            {
                //加入删除的外键SQL
                for (int i = 0; i < foreignKeys.Count; i++)
                {
                    sb.Insert(0, foreignKeys[i]);
                    sb.AppendLine();
                }

                var cmdText = StringBuilderCache.GetStringAndRelease(sb);
                commands.Add(new NpgsqlCommand(cmdText));
            }

            #endregion
        }

        //reset
        needCommand = false;
        foreignKeys.Clear();

        //处理新增的成员
        var addedMembers = model.Members
            .Where(t => t.PersistentState == PersistentState.Detached)
            .ToArray();
        if (addedMembers.Length > 0)
        {
            #region ----新增的成员----

            var sb = StringBuilderCache.Acquire();
            foreach (var m in addedMembers)
            {
                if (m.Type == EntityMemberType.EntityField)
                {
                    needCommand = true;
                    sb.AppendFormat("ALTER TABLE \"{0}\" ADD COLUMN ", tableName);
                    BuildFieldDefine((EntityFieldModel)m, sb, false);
                    sb.Append(";");
                }
                else if (m.Type == EntityMemberType.EntityRef)
                {
                    var rm = (EntityRefModel)m;
                    if (!rm.IsAggregationRef) //只有非聚合引合创建外键
                    {
                        foreignKeys.Add(BuildForeignKey(rm, ctx, tableName));
                        //考虑CreateGetTreeNodeChildsDbFuncCommand
                    }
                }
            }

            if (needCommand)
            {
                //加入外键约束
                sb.AppendLine();
                for (var i = 0; i < foreignKeys.Count; i++)
                {
                    sb.AppendLine(foreignKeys[i]);
                }

                var cmdText = StringBuilderCache.GetStringAndRelease(sb);
                commands.Add(new NpgsqlCommand(cmdText));
            }

            #endregion
        }

        //reset
        needCommand = false;
        foreignKeys.Clear();

        //处理修改的成员
        var changedMembers = model.Members
            .Where(t => t.PersistentState == PersistentState.Modified)
            .ToArray();
        if (changedMembers.Length > 0)
        {
            #region ----修改的成员----

            foreach (var m in changedMembers)
            {
                if (m.Type == EntityMemberType.EntityField)
                {
                    var dfm = (EntityFieldModel)m;
                    //先处理数据类型变更，变更类型或者变更AllowNull或者变更默认值
                    if (dfm.IsFieldTypeChanged)
                    {
                        var sb = StringBuilderCache.Acquire();
                        sb.AppendFormat("ALTER TABLE \"{0}\" ALTER COLUMN ", tableName);
                        BuildFieldDefine(dfm, sb, true);

                        if (dfm.AllowNull)
                        {
                            sb.AppendFormat(",ALTER COLUMN \"{0}\" DROP NOT NULL",
                                dfm.SqlColOriginalName);
                        }
                        else
                        {
                            if (dfm.FieldType == EntityFieldType.Binary)
                                throw new Exception("Binary field must be allow null");
                            sb.AppendFormat(",ALTER COLUMN \"{0}\" SET NOT NULL",
                                dfm.SqlColOriginalName);
                        }

                        commands.Add(new NpgsqlCommand(StringBuilderCache.GetStringAndRelease(sb)));
                    }

                    //再处理重命名列
                    if (m.IsNameChanged)
                    {
                        var renameColCmd = new NpgsqlCommand(
                            $"ALTER TABLE \"{tableName}\" RENAME COLUMN \"{dfm.SqlColOriginalName}\" TO \"{dfm.SqlColName}\"");
                        commands.Add(renameColCmd);
                    }
                }

                //TODO:处理EntityRef更新与删除规则
                //注意不再需要同旧实现一样变更EntityRef的外键约束名称 "ALTER TABLE \"XXX\" RENAME CONSTRAINT \"XXX\" TO \"XXX\""
                //因为ModelFirst的外键名称为FK_{MemberId}；CodeFirst为导入的名称
            }

            #endregion
        }

        //处理主键变更
        if (model.SqlStoreOptions.PrimaryKeysHasChanged)
        {
            var sb = StringBuilderCache.Acquire();
            BuildPrimaryKey(model, tableName, sb, true);
            commands.Add(new NpgsqlCommand(StringBuilderCache.GetStringAndRelease(sb)));
        }

        //处理索引变更
        BuildIndexes(model, commands, tableName);

        return commands;
    }

    protected override DbCommand MakeDropTable(EntityModel model, IModelContainer ctx)
    {
        var tableName = model.SqlStoreOptions!.GetSqlTableName(true, ctx); //使用旧名称
        return new NpgsqlCommand($"DROP TABLE IF EXISTS \"{tableName}\"");
    }

    #region ====Help Methods====

    private static string GetActionRuleString(EntityRefActionRule rule)
    {
        return rule switch
        {
            EntityRefActionRule.NoAction => "NO ACTION",
            EntityRefActionRule.Cascade => "CASCADE",
            EntityRefActionRule.SetNull => "SET NULL",
            _ => "NO ACTION",
        };
    }

    private static void BuildFieldDefine(EntityFieldModel dfm, StringBuilder sb, bool forAlter)
    {
        var fieldName = forAlter ? dfm.SqlColOriginalName : dfm.SqlColName;
        sb.Append($"\"{fieldName}\" ");
        if (forAlter)
            sb.Append("TYPE ");

        switch (dfm.FieldType)
        {
            case EntityFieldType.String:
                sb.Append(dfm.Length == 0 ? "text " : $"varchar({dfm.Length}) ");
                break;
            case EntityFieldType.DateTime:
                sb.Append("timestamptz ");
                break;
            case EntityFieldType.Short:
                sb.Append("int2 ");
                break;
            case EntityFieldType.Int:
                sb.Append("int4 ");
                break;
            case EntityFieldType.Long:
                sb.Append("int8 ");
                break;
            case EntityFieldType.Decimal:
                sb.AppendFormat("decimal({0},{1}) ", dfm.Length + dfm.Decimals, dfm.Decimals);
                break;
            case EntityFieldType.Bool:
                sb.Append("bool ");
                break;
            case EntityFieldType.Guid:
                sb.Append("uuid ");
                break;
            case EntityFieldType.Byte:
                sb.Append("int2 ");
                break;
            case EntityFieldType.Enum:
                sb.Append("int4 ");
                break;
            case EntityFieldType.Float:
                sb.Append("float4 ");
                break;
            case EntityFieldType.Double:
                sb.Append("float8 ");
                break;
            case EntityFieldType.Binary:
                sb.Append("bytea ");
                break;
            default:
                throw new NotImplementedException(
                    $"PgSqlStore.BuildFieldDefine with type: {dfm.FieldType}");
        }

        if (!dfm.AllowNull && !forAlter)
        {
            if (dfm.FieldType == EntityFieldType.Binary)
                throw new Exception("Binary field must be allow null");

            sb.Append("NOT NULL ");
        }
    }

    private static string BuildForeignKey(EntityRefModel rm, IModelContainer ctx, string tableName)
    {
        var refModel = ctx.GetEntityModel(rm.RefModelIds[0]);
        //使用模型标识+成员标识作为fk name以减少重命名带来的影响
        var fkName = $"FK_{rm.Owner.Id}_{rm.MemberId}";
        var rsb = StringBuilderCache.Acquire();
        rsb.Append($"ALTER TABLE \"{tableName}\" ADD CONSTRAINT \"{fkName}\" FOREIGN KEY (");
        for (var i = 0; i < rm.FKMemberIds.Length; i++)
        {
            var fk = (EntityFieldModel)rm.Owner.GetMember(rm.FKMemberIds[i], true)!;
            if (i != 0) rsb.Append(',');
            rsb.Append($"\"{fk.SqlColName}\"");
        }

        rsb.Append($") REFERENCES \"{refModel.SqlStoreOptions!.GetSqlTableName(false, ctx)}\" ("); //引用目标使用新名称
        for (var i = 0; i < refModel.SqlStoreOptions!.PrimaryKeys.Length; i++)
        {
            var pk = (EntityFieldModel)refModel.GetMember(
                refModel.SqlStoreOptions!.PrimaryKeys[i].MemberId, true)!;
            if (i != 0) rsb.Append(',');
            rsb.Append($"\"{pk.SqlColName}\"");
        }

        //TODO:pg's MATCH SIMPLE?
        rsb.Append(
            $") ON UPDATE {GetActionRuleString(rm.UpdateRule)} ON DELETE {GetActionRuleString(rm.DeleteRule)};");
        return StringBuilderCache.GetStringAndRelease(rsb);
    }

    private static void BuildIndexes(EntityModel model, List<DbCommand> commands, string tableName)
    {
        Debug.Assert(commands != null);
        if (!model.SqlStoreOptions!.HasIndexes)
            return;

        if (model.PersistentState != PersistentState.Detached)
        {
            var deletedIndexes =
                model.SqlStoreOptions.Indexes.Where(t => t.PersistentState == PersistentState.Deleted);
            foreach (var index in deletedIndexes)
            {
                commands.Add(new NpgsqlCommand($"DROP INDEX IF EXISTS \"IX_{model.Id}_{index.IndexId}\""));
            }
        }

        var newIndexes =
            model.SqlStoreOptions.Indexes.Where(t => t.PersistentState == PersistentState.Detached);
        foreach (var index in newIndexes)
        {
            var sb = StringBuilderCache.Acquire();
            sb.Append("CREATE ");
            if (index.Unique) sb.Append("UNIQUE ");
            sb.Append($"INDEX \"IX_{model.Id}_{index.IndexId}\" ON \"{tableName}\" (");
            for (var i = 0; i < index.Fields.Length; i++)
            {
                if (i != 0) sb.Append(',');
                var dfm = (EntityFieldModel)model.GetMember(index.Fields[i].MemberId, true)!;
                sb.Append($"\"{dfm.SqlColName}\"");
                if (index.Fields[i].OrderByDesc) sb.Append(" DESC");
            }

            sb.Append(')');
            commands.Add(new NpgsqlCommand(StringBuilderCache.GetStringAndRelease(sb)));
        }

        //暂不处理改变的索引
    }

    private static void BuildPrimaryKey(EntityModel model, string tableName, StringBuilder sb, bool forAlter)
    {
        var pkName = $"PK_{model.Id}"; //使用模型标识作为PK名称以避免重命名影响
        sb.Append($"ALTER TABLE \"{tableName}\" ");

        if (forAlter)
        {
            sb.Append($"DROP CONSTRAINT IF EXISTS \"{pkName}\"");
            if (model.SqlStoreOptions!.HasPrimaryKeys)
            {
                sb.Append(',');
            }
            else
            {
                sb.Append(';');
                return;
            }
        }

        sb.Append($" ADD CONSTRAINT \"{pkName}\"");
        sb.Append(" PRIMARY KEY (");
        foreach (var pk in model.SqlStoreOptions!.PrimaryKeys)
        {
            var mm = (EntityFieldModel)model.GetMember(pk.MemberId, true)!;
            sb.Append($"\"{mm.SqlColName}\",");
        }

        sb.Remove(sb.Length - 1, 1);
        sb.Append(");");
    }

    #endregion
}