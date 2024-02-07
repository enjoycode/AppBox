using System;
using System.Threading.Tasks;
using AppBoxCore;

namespace AppBoxClient;

public static class Channel
{
    private static IChannel _provider = null!;

    public static void Init(IChannel provider)
    {
        _provider = provider;
    }

    public static Task Login(string user, string password, object? external = null)
        => _provider.Login(user, password, external);

    public static Task Logout() => _provider.Logout();

    public static async Task Invoke(string service, object?[]? args = null)
    {
        await _provider.Invoke(service, args, null);
    }

    public static async Task<T?> Invoke<T>(string service, object?[]? args = null,
        EntityFactory[]? entityFactories = null)
    {
        var res = await _provider.Invoke(service, args, entityFactories);
        if (res == null) return default;

        return (T)res;
    }

    //暂时放在这里，待移至RuntimeContext内
    public static async Task<bool> HasPermission(ModelId permissionModelId)
    {
        if (permissionModelId.Type != ModelType.Permission)
        {
            Log.Error("Not a Permission model");
            return false;
        }

        var args = new object?[] { permissionModelId.Value };
        try
        {
            var res = await Invoke<bool>("sys.SystemService.HasPermission", args);
            return res;
        }
        catch (Exception e)
        {
            Log.Error($"Check has permission error: {e.Message}");
            return false;
        }
    }
}