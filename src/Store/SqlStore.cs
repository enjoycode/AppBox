using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Diagnostics;
using System.Text;
using System.Threading.Tasks;
using AppBoxCore;

namespace AppBoxStore;

/// <summary>
/// SqlStore的基类
/// </summary>
public abstract class SqlStore
{
    #region ====Statics====

    private static readonly Dictionary<long, SqlStore> SqlStores = new();

#if !FUTURE
    public static readonly long DefaultSqlStoreId = StringUtil.GetHashCode("Default");

    public static SqlStore Default { get; private set; }

    public static void InitDefaultSqlStore(SqlStore defaultSqlStore)
    {
        Debug.Assert(defaultSqlStore != null);
        SqlStores.Add(DefaultSqlStoreId, defaultSqlStore);
        Default = defaultSqlStore;
    }
#endif

    /// <summary>
    /// 获取SqlStore实例，缓存不存在则创建
    /// </summary>
    public static SqlStore Get(long storeId)
    {
        throw new NotImplementedException();
        // if (!sqlStores.TryGetValue(storeId, out SqlStore res))
        // {
        //     lock (sqlStores)
        //     {
        //         if (!sqlStores.TryGetValue(storeId, out res))
        //         {
        //             //加载存储模型
        //             if (!(ModelStore.LoadModelAsync(storeId).Result is DataStoreModel model)
        //                 || model.Kind != DataStoreKind.Sql)
        //                 throw new Exception($"Can't get SqlStore[Id={storeId}]");
        //
        //             //根据Provider创建实例
        //             var ps = model.Provider.Split(';');
        //             var asmPath = Path.Combine(RuntimeContext.Current.AppPath,
        //                 Server.Consts.LibPath, ps[0] + ".dll");
        //             try
        //             {
        //                 var asm = Assembly.LoadFile(asmPath);
        //                 var type = asm.GetType(ps[1]);
        //                 res = (SqlStore)Activator.CreateInstance(type, model.Settings);
        //                 sqlStores[storeId] = res;
        //                 Log.Debug($"Create SqlStore instance: {type}, isNull={res == null}");
        //                 return res;
        //             }
        //             catch (Exception ex)
        //             {
        //                 var error =
        //                     $"Create SqlStore[Provider={model.Provider}] instance error: {ex.Message}";
        //                 throw new Exception(error);
        //             }
        //         }
        //     }
        // }
        //
        // return res;
    }

    #endregion

    #region ====Properties====

    /// <summary>
    /// 名称转义符，如PG用引号包括字段名称\"xxx\"
    /// </summary>
    public abstract string NameEscaper { get; }

    /// <summary>
    /// 命令参数的前缀，eg: @
    /// </summary>
    public abstract string ParameterPrefix { get; }

    /// <summary>
    /// 用于消除差异,eg: PgSqlStore=bytea
    /// </summary>
    public abstract string BlobType { get; }

    /// <summary>
    /// 是否支持原子Upsert
    /// </summary>
    public abstract bool IsAtomicUpsertSupported { get; }

    /// <summary>
    /// 某些数据库不支持Retuning，所以需要单独读取
    /// </summary>
    public abstract bool UseReaderForOutput { get; }

    #endregion

    #region ====Connection & Command & Transaction====

    public abstract DbConnection MakeConnection();

    public abstract DbCommand MakeCommand();

    public async Task<DbConnection> OpenConnectionAsync()
    {
        var conn = MakeConnection();
        await conn.OpenAsync();
        return conn;
    }

    public async Task<DbTransaction> BeginTransactionAsync()
    {
        var conn = await OpenConnectionAsync();
        return await conn.BeginTransactionAsync();
    }

    #endregion

    #region ====DDL Methods====

    public async Task CreateTableAsync(EntityModel model, DbTransaction txn, IDesignContext ctx)
    {
        Debug.Assert(txn != null);
        var cmds = MakeCreateTable(model, ctx);
        foreach (var cmd in cmds)
        {
            cmd.Connection = txn.Connection;
            await cmd.ExecuteNonQueryAsync();
        }
    }

    public async Task AlterTableAsync(EntityModel model, DbTransaction txn, IDesignContext ctx)
    {
        Debug.Assert(txn != null);
        var cmds = MakeAlterTable(model, ctx);
        foreach (var cmd in cmds)
        {
            cmd.Connection = txn.Connection;
            await cmd.ExecuteNonQueryAsync();
        }
    }

    public async Task DropTableAsync(EntityModel model, DbTransaction txn, IDesignContext ctx)
    {
        Debug.Assert(txn != null);
        var cmd = MakeDropTable(model, ctx);
        cmd.Connection = txn.Connection;
        await cmd.ExecuteNonQueryAsync();
    }

    protected internal abstract IList<DbCommand> MakeCreateTable(EntityModel model,
        IDesignContext ctx);

    protected internal abstract IList<DbCommand> MakeAlterTable(EntityModel model,
        IDesignContext ctx);

    protected internal abstract DbCommand MakeDropTable(EntityModel model, IDesignContext ctx);

    #endregion

    #region ====DML Insert/Update/Delete Entity====

    public async Task<int> InsertAsync(SqlEntity entity, DbTransaction? txn = null)
    {
        if (entity == null) throw new ArgumentNullException(nameof(entity));
        if (entity.PersistentState != PersistentState.Detached)
            throw new InvalidOperationException("Can't insert none new entity");

        var model = await RuntimeContext.GetModelAsync<EntityModel>(entity.ModelId);
        if (model.SqlStoreOptions == null)
            throw new InvalidOperationException("Can't insert entity to sqlstore");

        var cmd = BuildInsertCommand(entity, model);
        cmd.Connection = txn != null ? txn.Connection : MakeConnection();
        cmd.Transaction = txn;
        if (txn == null)
            await cmd.Connection.OpenAsync();
        Log.Debug(cmd.CommandText);
        //执行命令
        try
        {
            return await cmd.ExecuteNonQueryAsync();
        }
        catch (Exception ex)
        {
            Log.Warn($"Exec sql error: {ex.Message}\n{cmd.CommandText}");
            throw;
        }
        finally
        {
            if (txn == null) cmd.Connection.Dispose();
        }
    }

    /// <summary>
    /// 仅适用于更新具备主键的实体，否则使用SqlUpdateCommand明确字段及条件更新
    /// </summary>
    public async Task<int> UpdateAsync(SqlEntity entity, DbTransaction? txn = null)
    {
        if (entity == null) throw new ArgumentNullException(nameof(entity));
        if (entity.PersistentState == PersistentState.Detached)
            throw new InvalidOperationException("Can't update new entity");
        if (entity.PersistentState == PersistentState.Deleted)
            throw new InvalidOperationException("Entity already deleted");

        var model = await RuntimeContext.GetModelAsync<EntityModel>(entity.ModelId);
        if (model.SqlStoreOptions == null)
            throw new InvalidOperationException("Can't update entity to sqlstore");
        if (!model.SqlStoreOptions.HasPrimaryKeys)
            throw new InvalidOperationException("Can't update entity without primary key");

        var cmd = BuildUpdateCommand(entity, model);
        cmd.Connection = txn != null ? txn.Connection : MakeConnection();
        cmd.Transaction = txn;
        if (txn == null)
            await cmd.Connection.OpenAsync();
        Log.Debug(cmd.CommandText);
        //执行命令
        try
        {
            return await cmd.ExecuteNonQueryAsync();
        }
        catch (Exception ex)
        {
            Log.Warn($"Exec sql error: {ex.Message}\n{cmd.CommandText}");
            throw;
        }
        finally
        {
            if (txn == null) cmd.Connection.Dispose();
        }
    }

    /// <summary>
    /// 仅适用于删除具备主键的实体，否则使用SqlDeleteCommand明确指定条件删除
    /// </summary>
    public async Task<int> DeleteAsync(SqlEntity entity, DbTransaction? txn = null)
    {
        if (entity == null) throw new ArgumentNullException(nameof(entity));
        if (entity.PersistentState == PersistentState.Detached)
            throw new InvalidOperationException("Can't delete new entity");

        var model = await RuntimeContext.GetModelAsync<EntityModel>(entity.ModelId);
        if (model.SqlStoreOptions == null)
            throw new InvalidOperationException("Can't delete entity from sqlstore");
        if (!model.SqlStoreOptions.HasPrimaryKeys)
            throw new InvalidOperationException("Can't delete entity without primary key");

        var cmd = BuildDeleteCommand(entity, model);
        cmd.Connection = txn != null ? txn.Connection : MakeConnection();
        cmd.Transaction = txn;
        if (txn == null)
            await cmd.Connection.OpenAsync();
        Log.Debug(cmd.CommandText);
        //执行命令
        try
        {
            return await cmd.ExecuteNonQueryAsync();
        }
        catch (Exception ex)
        {
            Log.Warn($"Exec sql error: {ex.Message}\n{cmd.CommandText}");
            throw;
        }
        finally
        {
            if (txn == null) cmd.Connection.Dispose();
        }
    }

    #endregion

    #region ====DML Methods====

    //TODO:**** cache Load\Insert\Update\Delete command

    // /// <summary>
    // /// 从存储加载指定主键的单个实体，不存在返回null
    // /// </summary>
    // public async Task<Entity> LoadAsync(ulong modelId, DbTransaction txn, params EntityMember[] pks)
    // {
    //     if (pks == null || pks.Length == 0) throw new ArgumentNullException(nameof(pks));
    //
    //     var model = await RuntimeContext.Current.GetModelAsync<EntityModel>(modelId);
    //     if (model.SqlStoreOptions == null || !model.SqlStoreOptions.HasPrimaryKeys
    //                                       || model.SqlStoreOptions.PrimaryKeys.Count != pks.Length)
    //         throw new InvalidOperationException("Can't load entity from sqlstore");
    //
    //     var cmd = BuildLoadCommand(model, pks);
    //     cmd.Connection = txn != null ? txn.Connection : MakeConnection();
    //     if (txn == null)
    //         await cmd.Connection.OpenAsync();
    //
    //     try
    //     {
    //         using var reader = await cmd.ExecuteReaderAsync();
    //         if (await reader.ReadAsync())
    //         {
    //             return SqlQuery.FillEntity(model, reader);
    //         }
    //
    //         return null;
    //     }
    //     catch (Exception ex)
    //     {
    //         Log.Warn($"Exec sql error: {ex.Message}\n{cmd.CommandText}");
    //         throw;
    //     }
    //     finally
    //     {
    //         if (txn == null) cmd.Connection.Dispose();
    //     }
    // }

    // public async Task ExecCommandAsync(SqlUpdateCommand updateCommand, DbTransaction txn = null)
    // {
    //     //暂不支持无条件更新，以防止误操作
    //     if (Expressions.Expression.IsNull(updateCommand.Filter))
    //         throw new NotSupportedException("Update must assign Where condition");
    //
    //     var cmd = BuidUpdateCommand(updateCommand);
    //     cmd.Connection = txn != null ? txn.Connection : MakeConnection();
    //     cmd.Transaction = txn;
    //     if (txn == null)
    //         await cmd.Connection.OpenAsync();
    //     Log.Debug(cmd.CommandText);
    //     //执行命令
    //     if (updateCommand.OutputItems != null && UseReaderForOutput) //返回字段通过DbReader读取
    //     {
    //         try
    //         {
    //             using var reader = await cmd.ExecuteReaderAsync();
    //             while (await reader.ReadAsync())
    //             {
    //                 updateCommand.SetOutputs(new SqlRowReader(reader));
    //             }
    //         }
    //         catch (Exception ex)
    //         {
    //             Log.Warn($"Exec sql error: {ex.Message}\n{cmd.CommandText}");
    //             throw;
    //         }
    //         finally
    //         {
    //             if (txn == null) cmd.Connection.Dispose();
    //         }
    //     }
    //     else
    //     {
    //         try
    //         {
    //             await cmd.ExecuteNonQueryAsync();
    //         }
    //         catch (Exception ex)
    //         {
    //             Log.Warn($"Exec sql error: {ex.Message}\n{cmd.CommandText}");
    //             throw;
    //         }
    //         finally
    //         {
    //             if (txn == null) cmd.Connection.Dispose();
    //         }
    //
    //         if (updateCommand.OutputItems != null)
    //         {
    //             throw new NotImplementedException(); //TODO:读取输出参数值
    //         }
    //     }
    // }

    // public async Task<int> ExecCommandAsync(SqlDeleteCommand deleteCommand,
    //     DbTransaction txn = null)
    // {
    //     //暂不支持无条件删除，以防止误操作
    //     if (Expressions.Expression.IsNull(deleteCommand.Filter))
    //         throw new NotSupportedException("Delete must assign Where condition");
    //
    //     var cmd = BuildDeleteCommand(deleteCommand);
    //     cmd.Connection = txn != null ? txn.Connection : MakeConnection();
    //     cmd.Transaction = txn;
    //     if (txn == null)
    //         await cmd.Connection.OpenAsync();
    //     Log.Debug(cmd.CommandText);
    //     //执行命令
    //     try
    //     {
    //         return await cmd.ExecuteNonQueryAsync();
    //     }
    //     catch (Exception ex)
    //     {
    //         Log.Warn($"Exec sql error: {ex.Message}\n{cmd.CommandText}");
    //         throw;
    //     }
    //     finally
    //     {
    //         if (txn == null) cmd.Connection.Dispose();
    //     }
    // }

    /// <summary>
    /// 根据主键值生成加载单个实体的sql
    /// </summary>
    // protected internal virtual DbCommand BuildLoadCommand(EntityModel model, EntityMember[] pks)
    // {
    //     var cmd = MakeCommand();
    //     var sb = StringBuilderCache.Acquire();
    //     int pindex = 0;
    //     EntityMemberModel mm;
    //     var tableName = model.GetSqlTableName(false, null);
    //
    //     sb.Append($"Select * From {NameEscaper}{tableName}{NameEscaper} Where ");
    //     for (int i = 0; i < model.SqlStoreOptions.PrimaryKeys.Count; i++)
    //     {
    //         pindex++;
    //         var para = MakeParameter();
    //         para.ParameterName = $"V{pindex}";
    //         para.Value = pks[i].BoxedValue;
    //         cmd.Parameters.Add(para);
    //
    //         //注意隐式转换的pk的MemberId = 0, 所以不要读pks[i].Id
    //         mm = model.GetMember(model.SqlStoreOptions.PrimaryKeys[i].MemberId, true);
    //         if (i != 0) sb.Append(" And ");
    //         sb.Append($"{NameEscaper}{mm.Name}{NameEscaper}=@{para.ParameterName}");
    //     }
    //
    //     sb.Append(" Limit 1");
    //
    //     cmd.CommandText = StringBuilderCache.GetStringAndRelease(sb);
    //     return cmd;
    // }

    /// <summary>
    /// 根据Entity及其模型生成相应的Insert命令
    /// </summary>
    protected internal virtual DbCommand BuildInsertCommand(SqlEntity entity, EntityModel model)
    {
        //TODO: cache SqlText to EntityModel's SqlStoreOptions
        var cmd = MakeCommand();
        var entityMemberWriter = new DbCommandParameterWriter(cmd);
        var sb = StringBuilderCache.Acquire();
        sb.Append("Insert Into ");
        sb.AppendWithNameEscaper(model.GetSqlTableName(false, null), NameEscaper);
        sb.Append(" (");

        var parasCount = 0; //用于判断有没有写入字段值
        var members = model.Members;
        foreach (var member in members)
        {
            if (member.Type != EntityMemberType.DataField) continue;

            var dataField = (DataFieldModel)member;
            entity.WriteMember(dataField.MemberId, entityMemberWriter, EntityMemberWriteFlags.None);
            if (cmd.Parameters.Count > parasCount) //已写入实体成员
            {
                if (parasCount != 0) sb.Append(',');
                sb.AppendWithNameEscaper(dataField.Name, NameEscaper);
                parasCount = cmd.Parameters.Count;
            }
        }

        sb.Append(") Values (");

        for (var i = 0; i < cmd.Parameters.Count; i++)
        {
            if (i != 0) sb.Append(',');
            sb.Append(ParameterPrefix);
            sb.Append(cmd.Parameters[i].ParameterName);
        }

        sb.Append(')');

        cmd.CommandText = StringBuilderCache.GetStringAndRelease(sb);
        return cmd;
    }

    protected internal virtual DbCommand BuildUpdateCommand(SqlEntity entity, EntityModel model)
    {
        var cmd = MakeCommand();
        var entityMemberWriter = new DbCommandParameterWriter(cmd);
        var sb = StringBuilderCache.Acquire();
        var tableName = model.GetSqlTableName(false, null);

        sb.Append("Update ");
        sb.AppendWithNameEscaper(tableName, NameEscaper);
        sb.Append(" Set ");

        var hasChangedMember = false;
        foreach (var mm in model.Members)
        {
            if (mm.Type != EntityMemberType.DataField) continue;

            var dfm = (DataFieldModel)mm;
            if (dfm.IsPrimaryKey) continue; //跳过主键
            if (!entity.IsMemberChanged(dfm.MemberId)) continue; //字段值无改变

            entity.WriteMember(mm.MemberId, entityMemberWriter, EntityMemberWriteFlags.None);

            if (hasChangedMember) sb.Append(",");
            else hasChangedMember = true;

            sb.AppendWithNameEscaper(dfm.SqlColName, NameEscaper);
            sb.Append('=');
            sb.Append(ParameterPrefix);
            sb.Append(cmd.Parameters[^1].ParameterName);
        }

        if (!hasChangedMember)
            throw new InvalidOperationException("entity has no changed member");

        //根据主键生成条件
        sb.Append(" Where ");
        BuildWhereForUpdateOrDelete(entity, model, cmd, sb);

        cmd.CommandText = StringBuilderCache.GetStringAndRelease(sb);
        return cmd;
    }

    protected internal virtual DbCommand BuildDeleteCommand(SqlEntity entity, EntityModel model)
    {
        var cmd = MakeCommand();
        var sb = StringBuilderCache.Acquire();
        var tableName = model.GetSqlTableName(false, null);

        sb.Append($"Delete From {NameEscaper}{tableName}{NameEscaper} Where ");
        //根据主键生成条件
        BuildWhereForUpdateOrDelete(entity, model, cmd, sb);

        cmd.CommandText = StringBuilderCache.GetStringAndRelease(sb);
        return cmd;
    }

    private void BuildWhereForUpdateOrDelete(SqlEntity entity, EntityModel model, DbCommand cmd,
        StringBuilder sb)
    {
        var entityMemberWriter = new DbCommandParameterWriter(cmd);
        for (var i = 0; i < model.SqlStoreOptions!.PrimaryKeys.Length; i++)
        {
            var pk = model.SqlStoreOptions.PrimaryKeys[i];
            var mm = (DataFieldModel)model.GetMember(pk.MemberId, true)!;

            entity.WriteMember(pk.MemberId, entityMemberWriter, EntityMemberWriteFlags.None);

            if (i != 0) sb.Append(" And");
            sb.Append(' ');
            sb.AppendWithNameEscaper(mm.SqlColName, NameEscaper);
            sb.Append('=');
            sb.Append(ParameterPrefix);
            sb.Append(cmd.Parameters[^1].ParameterName);
        }
    }

    // protected internal abstract DbCommand BuildDeleteCommand(SqlDeleteCommand deleteCommand);
    //
    // /// <summary>
    // /// 将SqlUpdateCommand转换为sql
    // /// </summary>
    // protected internal abstract DbCommand BuidUpdateCommand(SqlUpdateCommand updateCommand);
    //
    // protected internal abstract DbCommand BuildQuery(ISqlSelectQuery query);

    #endregion
}

internal static class StringBuilderExtensions
{
    internal static void AppendWithNameEscaper(this StringBuilder sb, string name, string escaper)
    {
        sb.Append(escaper);
        sb.Append(name);
        sb.Append(escaper);
    }
}