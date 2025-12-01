using System;
using System.IO;
using System.Threading.Tasks;
using AppBoxCore;

namespace AppBoxClient;

public static class Channel
{
    public static string SessionName => Provider?.SessionName ?? string.Empty;

    public static Guid LeafOrgUnitId => Provider?.LeafOrgUnitId ?? Guid.Empty;

    public static IChannel Provider { get; private set; } = null!;

    public static void Init(IChannel provider)
    {
        Provider = provider;
    }

    public static Task Login(string user, string password, string? external = null)
        => Provider.Login(user, password, external);

    public static Task Logout() => Provider.Logout();

    public static async Task Invoke(string service, object?[]? args = null)
    {
        await Invoke<object?>(service, args, null);
    }

    public static async Task<T?> Invoke<T>(string service, object?[]? args = null,
        EntityFactory[]? entityFactories = null)
    {
        var rs = await Provider.Invoke(service, w =>
        {
            if (args != null && args.Length > 0)
            {
                for (var i = 0; i < args.Length; i++)
                {
                    w.Serialize(args[i]);
                }
            }
        });
        if (entityFactories != null)
            rs.Context.SetEntityFactories(entityFactories);

        // deserialize response
        var errorCode = (InvokeErrorCode)rs.ReadByte();
        object? result = null;
        if (rs.HasRemaining) //因有些错误可能不包含数据，只有错误码
        {
            try
            {
                result = rs.Deserialize();
            }
            catch (Exception ex)
            {
                errorCode = InvokeErrorCode.DeserializeResponseFail;
                result = ex.Message;
            }
            finally
            {
                rs.Free();
            }
        }

        if (errorCode != InvokeErrorCode.None)
            throw new Exception($"Code={errorCode} Msg={result}");

        if (result == null) return default;
        return (T)result;
    }

    public static async Task Invoke(string service, Action<IOutputStream> argsWriter)
    {
        var rs = await Provider.Invoke(service, argsWriter);
        var errorCode = (InvokeErrorCode)rs.ReadByte();
        rs.Free();
        if (errorCode != InvokeErrorCode.None)
            throw new Exception($"Code={errorCode}");
    }

    public static async Task<Stream> InvokeForStream(string service, object?[]? args = null)
    {
        var rs = await Provider.Invoke(service, w =>
        {
            if (args != null && args.Length > 0)
            {
                for (var i = 0; i < args.Length; i++)
                {
                    w.Serialize(args[i]);
                }
            }
        });

        // deserialize response
        var errorCode = (InvokeErrorCode)rs.ReadByte();
        if (errorCode != InvokeErrorCode.None)
        {
            rs.Free();
            throw new Exception($"Code={errorCode}");
        }

        return rs.WrapToStream();
    }

    //暂时放在这里，待移至RuntimeContext内
    public static async Task<bool> HasPermission(ModelId permissionModelId)
    {
        if (permissionModelId.Type != ModelType.Permission)
        {
            // Log.Error("Not a Permission model");
            return false;
        }

        try
        {
            var res = await Invoke<bool>("sys.SystemService.HasPermission", [permissionModelId.Value]);
            return res;
        }
        catch (Exception e)
        {
            // Log.Error($"Check has permission error: {e.Message}");
            return false;
        }
    }
}