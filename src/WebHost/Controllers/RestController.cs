using AppBoxCore;
using AppBoxServer;

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

        Log.Debug($"user={user} pass={pass} external={external}");

        httpContext.Response.ContentType = "application/octet-stream";
        try
        {
            if (string.IsNullOrEmpty(external))
            {
                throw new NotImplementedException("None external login for rest api");
            }
            else
            {
                var args = InvokeArgs.Make(user, pass);
                var res = await RuntimeContext.InvokeAsync($"{external}.Login", args);
                var treePath = (TreePath)res.BoxedValue!;

                //注册外部用户会话
                var session = new RestExternalSession(treePath);
                ExternalSessionManager.Provider.Register(session);

                var writer = new PipeOutput(httpContext.Response.BodyWriter);
                writer.WriteByte(0);
                writer.WriteString(session.SessionId);
                writer.WriteString(session.Name);
            }
        }
        catch (Exception e)
        {
            var writer = new PipeOutput(httpContext.Response.BodyWriter);
            writer.WriteByte(1);
            writer.WriteString(e.Message);
        }

        await httpContext.Response.BodyWriter.FlushAsync();
    }

    public static async Task Invoke(HttpContext httpContext)
    {
        string? sessionId = httpContext.Request.Headers["SessionId"];
        var requestBody = await httpContext.Request.BodyReader.CopyToAsync();
        var reader = MessageReadStream.Rent(requestBody);
        var service = reader.ReadString()!;
        //设置当前会话
        if (!string.IsNullOrEmpty(sessionId) && ExternalSessionManager.Provider.TryGet(sessionId, out var session))
            HostRuntimeContext.SetCurrentSession(session);
        
        throw new NotImplementedException();
    }
}