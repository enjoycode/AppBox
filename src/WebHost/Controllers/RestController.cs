using AppBoxCore;
using AppBoxServer;
using static AppBoxServer.ServerLogger;

namespace AppBoxWebHost;

/// <summary>
/// 用于传统Web rest api
/// </summary>
internal static class RestController
{
    public static async Task Login(HttpContext httpContext)
    {
        var requestBody = await httpContext.Request.BodyReader.CopyToAsync();
        var reader = MessageReadStream.Rent(requestBody);
        var user = reader.ReadString()!;
        var pass = reader.ReadString()!;
        var external = reader.ReadString()!;
        MessageReadStream.Return(reader);

        Logger.Debug($"user={user} pass={pass} external={external}");

        httpContext.Response.ContentType = "application/octet-stream";
        var writer = new PipeOutput(httpContext.Response.BodyWriter);
        try
        {
            if (string.IsNullOrEmpty(external))
                throw new NotImplementedException("None external login for rest api");

            var res = await RuntimeContext.Current.InvokeAsync($"{external}.Login", AnyArgs.Make(user, pass));
            var treePath = (TreePath)res.BoxedValue!;

            //注册外部用户会话
            var session = new RestExternalSession(treePath);
            ExternalSessionManager.Provider.Register(session);

            writer.WriteByte(0);
            writer.WriteString(session.SessionId);
            writer.WriteString(session.Name);
        }
        catch (Exception e)
        {
            writer.WriteByte(1);
            writer.WriteString(e.Message);
        }

        await httpContext.Response.BodyWriter.FlushAsync();
    }

    public static async Task Invoke(HttpContext httpContext)
    {
        var requestBody = await httpContext.Request.BodyReader.CopyToAsync();
        var reader = MessageReadStream.Rent(requestBody);

        //设置当前会话
        var sessionId = reader.ReadString();
        if (!string.IsNullOrEmpty(sessionId) && ExternalSessionManager.Provider.TryGet(sessionId, out var session))
            HostRuntimeContext.SetCurrentSession(session);
        var writer = new PipeOutput(httpContext.Response.BodyWriter);
        try
        {
            var service = reader.ReadString()!;
            var invokeResult = await ServiceContainer.InvokeAsync(service, AnyArgs.From(reader));
            writer.WriteByte(0);
            writer.Serialize(invokeResult.BoxedValue);
        }
        catch (Exception e)
        {
            httpContext.Response.Clear();
            writer.WriteByte(1);
            writer.WriteString(e.Message);
        }

        await httpContext.Response.BodyWriter.FlushAsync();
    }
}