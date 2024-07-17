using AppBoxCore;

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
        var user = (string?)reader.Deserialize();
        var pass = (string?)reader.Deserialize();
        var external = (string?)reader.Deserialize();
        MessageReadStream.Return(reader);
        
        Log.Debug($"user={user} pass={pass} external={external}");

        if (string.IsNullOrEmpty(external))
        {
            throw new NotImplementedException("None external login for rest api");
        }
        else
        {
            var args = InvokeArgs.Make(user, pass);
            var res = await RuntimeContext.InvokeAsync($"{external}.Login", args);
        }

        // Response.Headers.ContentEncoding = "br";
        // Response.ContentType = "application/octet-stream"; //application/x-binary
        httpContext.Response.ContentType = "text/html";
        

        var data = "Hello World"u8.ToArray();
        await httpContext.Response.BodyWriter.WriteAsync(data);
        await httpContext.Response.BodyWriter.FlushAsync();
    }
}