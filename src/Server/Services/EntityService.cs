using AppBoxCore;
using AppBoxStore;

namespace AppBoxServer;

/// <summary>
/// 通用的动态化实体增删改查服务
/// </summary>
internal sealed class EntityService : IService
{
    public static Task<DataTable> Fetch(DynamicQuery query)
    {
        var q = new SqlDynamicQuery(query);
        return q.ToDataTableAsync();
    }

    public static async Task Save(DataTable[] tables)
    {
        if (tables.Length == 0) return;

        //先检查数据表
        long? storeId = null;
        foreach (var table in tables)
        {
            if (table.EntityModelId == 0)
                throw new Exception("table has not map to entity");
            var model = await RuntimeContext.GetModelAsync<EntityModel>(table.EntityModelId);
            if (model.SqlStoreOptions == null)
                throw new Exception("table has not map to store");
            if (storeId == null)
                storeId = model.SqlStoreOptions.StoreModelId;
            else if (model.SqlStoreOptions.StoreModelId != storeId.Value)
                throw new Exception("table not in same store");
        }

        //开始事务保存
        var db = SqlStore.Get(storeId!.Value);
        var txn = await db.BeginTransactionAsync();
        try
        {
            foreach (var table in tables)
            {
                await db.SaveDataTableAsync(table, txn);
            }

            await txn.CommitAsync();
        }
        finally
        {
            await txn.DisposeAsync();
        }
    }

    public async ValueTask<AnyValue> InvokeAsync<T>(ReadOnlyMemory<char> method, T args)
        where T : struct, IInvokeArgs
    {
        switch (method.Span)
        {
            case nameof(Fetch): return AnyValue.From(await Fetch((DynamicQuery)args.GetObject()!));
            case nameof(Save):
            {
                await Save((DataTable[])args.GetObject()!);
                return AnyValue.Empty;
            }
            default: throw new Exception($"Can't find method: {method}");
        }
    }
}