using AppBoxClient;
using AppBoxCore;
using AppBoxStore.Entities;

namespace AppBoxDesign;

internal sealed class CheckoutService : ICheckoutService
{
    public async Task<Dictionary<string, CheckoutInfo>> LoadAllAsync()
    {
        var list = await Channel.Invoke<IList<Checkout>>("sys.DesignService.CheckoutLoadAll",
            null, [new EntityFactory(Checkout.MODELID, typeof(Checkout))]);
        if (list == null || list.Count == 0)
            return [];

        var dic = new Dictionary<string, CheckoutInfo>();
        foreach (var item in list)
        {
            var info = new CheckoutInfo((DesignNodeType)item.NodeType, item.TargetId,
                item.Version, item.DeveloperName, item.DeveloperId);
            dic.Add(info.GetKey(), info);
        }

        return dic;
    }

    public Task<CheckoutResult> CheckoutAsync(IList<CheckoutInfo> info)
    {
        return Channel.Invoke<CheckoutResult>("sys.DesignService.Checkout", [info])!;
    }
}