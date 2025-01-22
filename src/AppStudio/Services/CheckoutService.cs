using AppBoxClient;
using AppBoxCore;
using AppBoxStore.Entities;

namespace AppBoxDesign;

internal static class CheckoutService
{
    internal static async Task<Dictionary<string, CheckoutInfo>> LoadAllAsync()
    {
        var list = await Channel.Invoke<IList<Entity>>("sys.DesignService.CheckoutLoadAll",
            null, [new EntityFactory(Checkout.MODELID, typeof(Checkout))]);
        if (list == null || list.Count == 0)
            return [];

        var dic = new Dictionary<string, CheckoutInfo>();
        foreach (var item in list.Cast<Checkout>())
        {
            var info = new CheckoutInfo((DesignNodeType)item.NodeType, item.TargetId,
                item.Version, item.DeveloperName, item.DeveloperId);
            dic.Add(info.GetKey(), info);
        }

        return dic;
    }

    internal static Task<CheckoutResult> CheckoutAsync(IList<CheckoutInfo> info)
    {
        return Channel.Invoke<CheckoutResult>("sys.DesignService.Checkout", [info]);
    }
}