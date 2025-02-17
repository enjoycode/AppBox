using System;
using System.Threading.Tasks;
using AppBoxCore;
using static AppBoxStore.StoreLogger;

namespace AppBoxStore;

public static class SqlStoreInitiator
{
    public static async Task TryInitStoreAsync()
    {
        var db = SqlStore.Default;
        var esc = db.NameEscaper;
        //暂通过查询判断有无初始化过
        await using var cmd1 = db.MakeCommand();
        cmd1.CommandText =
            $"Select meta From {esc}sys.Meta{esc} Where meta={MetaType.Meta_Application} And id='{Consts.SYS_APP_ID.ToString()}'";
        await using var conn = db.MakeConnection();
        try
        {
            await conn.OpenAsync();
        }
        catch (Exception ex)
        {
            Logger.Warn($"Open sql connection error: {ex.Message}");
            Environment.Exit(0);
        }

        cmd1.Connection = conn;
        try
        {
            await using var dr = await cmd1.ExecuteReaderAsync();
            return;
        }
        catch (Exception ex)
        {
            Logger.Debug($"CMD:{cmd1.CommandText} MSG:{ex.Message}");
            Logger.Info("Start create meta store...");
        }

        //开始事务初始化
        await using var txn = await conn.BeginTransactionAsync();
        await using var cmd2 = db.MakeCommand();
        cmd2.CommandText =
            $"Create Table {esc}sys.Meta{esc} (meta smallint NOT NULL, id varchar(100) NOT NULL, model smallint, data {db.BlobType} NOT NULL);";
        cmd2.CommandText +=
            $"Alter Table {esc}sys.Meta{esc} Add CONSTRAINT {esc}PK_Meta{esc} Primary Key (meta,id);";
        cmd2.Connection = conn;
        cmd2.Transaction = txn;
        try
        {
            await cmd2.ExecuteNonQueryAsync();
            Logger.Info("Create meta table done.");
            await StoreInitiator.InitAsync(txn);
            await txn.CommitAsync();
            Logger.Info("Init default sql store done.");
        }
        catch (Exception ex)
        {
            Logger.Error($"Init default sql store error: {ex.GetType().Name}\n{ex.Message}\n{ex.StackTrace}");
            Environment.Exit(0); //TODO:退出前关闭子进程
        }
    }
}