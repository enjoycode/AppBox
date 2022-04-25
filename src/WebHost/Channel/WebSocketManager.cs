using System.Net.WebSockets;
using AppBoxCore;

namespace AppBoxWebHost;

/// <summary>
/// 管理所有客户端WebSocket连接
/// </summary>
internal static class WebSocketManager
{
    private static readonly IList<WebSocketClient> Anonymous = new List<WebSocketClient>();

    private static readonly ReaderWriterLockSlim AnonymousLock = new ReaderWriterLockSlim();

    private static readonly Dictionary<ulong, WebSocketClient> Clients =
        new Dictionary<ulong, WebSocketClient>();

    private static readonly ReaderWriterLockSlim ClientsLock = new ReaderWriterLockSlim();


    internal static async Task OnAccept(HttpContent content, WebSocket webSocket)
    {
        // 先加入匿名列表
        var client = new WebSocketClient(webSocket);
        AnonymousLock.EnterWriteLock();
        Anonymous.Add(client);
        AnonymousLock.ExitWriteLock();

        // 开始接收数据
        do
        {
            var frame = BytesSegment.Rent();
            ValueWebSocketReceiveResult result;
            try
            {
                result = await webSocket.ReceiveAsync(frame.Buffer.AsMemory(),
                    CancellationToken.None);
                if (result.MessageType == WebSocketMessageType.Close)
                {
                    BytesSegment.ReturnOne(frame);
                    break;
                }
            }
            catch (Exception ex)
            {
                BytesSegment.ReturnOne(frame);
                Log.Warn($"WebSocket receive error: {ex.Message}");
                break;
            }

            frame.Length = result.Count;

            await client.OnReceiveMessage(frame, result.EndOfMessage); //不需要捕获异常
        } while (true);

        try
        {
            await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty,
                CancellationToken.None);
        }
        catch (Exception ex)
        {
            Log.Debug($"关闭WebSocket通道失败:{ex.Message}，忽略继续");
        }

        //移除清理
        if (client.WebSession != null)
        {
            ClientsLock.EnterWriteLock();
            Clients.Remove(client.WebSession.SessionId);
            ClientsLock.ExitWriteLock();
            client.WebSession.Dispose();
        }
        else
        {
            AnonymousLock.EnterWriteLock();
            Anonymous.Remove(client);
            AnonymousLock.ExitWriteLock();
        }

        var leftCount = Anonymous.Count + Clients.Count;
        Log.Debug($"WebSocket关闭, 还余: {leftCount}");
    }
}