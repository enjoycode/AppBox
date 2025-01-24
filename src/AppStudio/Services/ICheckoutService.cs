namespace AppBoxDesign;

public interface ICheckoutService
{
    Task<Dictionary<string, CheckoutInfo>> LoadAllAsync();

    Task<CheckoutResult> CheckoutAsync(IList<CheckoutInfo> info);
}