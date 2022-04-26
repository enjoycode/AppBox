using System.Net.WebSockets;
using Microsoft.AspNetCore.Mvc;

namespace AppBoxWebHost;

public sealed class WebSocketController : ControllerBase
{
    [HttpGet("/ws")]
    public async Task Get()
    {
        if (!HttpContext.WebSockets.IsWebSocketRequest)
        {
            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
            return;
        }

        using var websocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
        await WebSocketManager.OnAccept(websocket);
    }
}