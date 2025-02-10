using System;
using System.IO;
using System.Threading.Tasks;
using AppBoxCore;

namespace AppBoxClient;

public static class Channel
{
    public static string SessionName => Provider?.SessionName ?? string.Empty;

    public static Guid LeafOrgUnitId => Provider?.LeafOrgUnitId ?? Guid.Empty;

    private static IChannel Provider { get; set; } = null!;

    public static void Init(IChannel provider)
    {
        Provider = provider;
    }

    public static Task Login(string user, string password, string? external = null)
        => Provider.Login(user, password, external);

    public static Task Logout() => Provider.Logout();

    public static async Task Invoke(string service, object?[]? args = null)
    {
        await Provider.Invoke(service, args, null);
    }

    public static async Task<T?> Invoke<T>(string service, object?[]? args = null,
        EntityFactory[]? entityFactories = null)
    {
        var res = await Provider.Invoke(service, args, entityFactories);
        if (res == null) return default;

        return (T)res;
    }

    public static async Task<Stream> InvokeForStream(string service, object?[]? args = null)
    {
        var rs = await Provider.InvokeForStream(service, args);
        var errorCode = (InvokeErrorCode)rs.ReadByte();
        if (errorCode != InvokeErrorCode.None)
        {
            MessageReadStream.Return(rs);
            throw new Exception($"Code={errorCode}");
        }

        return new MessageReadStreamWrap(rs);
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