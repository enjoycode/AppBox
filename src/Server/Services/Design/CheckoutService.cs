using AppBoxCore;
using AppBoxDesign;
using AppBoxStore;
using AppBoxStore.Entities;

namespace AppBoxServer.Design;

internal static class CheckoutService
{
    /// <summary>
    /// 签出指定节点
    /// </summary>
    internal static async Task<CheckoutResult> CheckoutAsync(IList<CheckoutInfo>? checkoutInfos)
    {
        if (checkoutInfos == null || checkoutInfos.Count == 0)
            throw new ArgumentException();

        //尝试向存储插入签出信息
#if FUTURE
        var txn = await Transaction.BeginAsync();
#else
        await using var conn = await SqlStore.Default.OpenConnectionAsync();
        await using var txn = await conn.BeginTransactionAsync();
#endif
        try
        {
            for (var i = 0; i < checkoutInfos.Count; i++)
            {
                var info = checkoutInfos[i];
                var obj = new Checkout(info.DeveloperOuid, (byte)info.NodeType, info.TargetId)
                    { DeveloperName = info.DeveloperName, Version = info.Version };

#if FUTURE
                await EntityStore.InsertEntityAsync(obj, txn);
#else
                await SqlStore.Default.InsertAsync(obj, txn);
#endif
            }

            await txn.CommitAsync();
        }
        catch (Exception)
        {
            await txn.RollbackAsync();
            return new CheckoutResult(false);
        }

        //检查签出单个模型时，存储有无新版本
        var result = new CheckoutResult(true);
        if (checkoutInfos[0].IsSingleModel)
        {
            var storedModel = await MetaStore.Provider.LoadModelAsync(checkoutInfos[0].TargetId);
            if (storedModel.Version != checkoutInfos[0].Version)
                result.ModelWithNewVersion = storedModel;
        }

        return result;
    }

    /// <summary>
    /// 用于DesignTree加载时
    /// </summary>
    internal static async Task<IList<Checkout>> LoadAllAsync()
    {
#if FUTURE
        var q = new TableScan(Consts.SYS_CHECKOUT_MODEL_ID);
#else
        var q = new SqlQuery<Checkout>(Checkout.MODELID);
#endif
        var res = await q.ToListAsync();
        return res;
    }

    /// <summary>
    /// 签入当前用户所有已签出项
    /// </summary>
    internal static async Task CheckinAsync(System.Data.Common.DbTransaction txn)
    {
        var devId = RuntimeContext.CurrentSession!.LeafOrgUnitId;

        //TODO:***** Use DeleteCommand(join txn), 暂临时使用查询再删除
#if FUTURE
        var q = new TableScan(Consts.SYS_CHECKOUT_MODEL_ID);
        q.Filter(q.GetGuid(Consts.CHECKOUT_DEVELOPERID_ID) == devId);
#else
        var q = new SqlQuery<Checkout>(Checkout.MODELID);
        q.Where(t => t["DeveloperId"] == devId);
#endif

        var list = await q.ToListAsync();
        for (var i = 0; i < list.Count; i++)
        {
#if FUTURE
            await EntityStore.DeleteEntityAsync(model, list[i].Id, txn);
#else
            await SqlStore.Default.DeleteAsync(list[i], txn);
#endif
        }
    }
}