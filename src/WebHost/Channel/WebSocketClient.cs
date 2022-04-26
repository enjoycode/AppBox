using System.Buffers;
using System.Net.WebSockets;
using AppBoxChannel;
using AppBoxCore;

namespace AppBoxWebHost;

internal sealed class WebSocketClient
{
    private readonly WebSocket _webSocket;
    private BytesSegment? _pending;
    private readonly SemaphoreSlim _sendLock = new SemaphoreSlim(1, 1);
    internal WebSession? WebSession { get; set; }

    public WebSocketClient(WebSocket webSocket)
    {
        _webSocket = webSocket;
    }

    /// <summary>
    /// 组合并处理收到的消息
    /// </summary>
    internal async ValueTask OnReceiveMessage(BytesSegment frame, bool isEnd)
    {
        if (!isEnd)
        {
            _pending?.Append(frame);
            _pending = frame;
            return;
        }

        //检查有没有前面的消息帧
        if (_pending != null)
        {
            _pending.Append(frame);
            _pending = null;
        }

        //开始读取并处理消息
        var reader = MessageReadStream.Rent(frame.First!);
        var msgId = int.MinValue;
        try
        {
            var msgType = (MessageType)reader.ReadByte();
            msgId = reader.ReadInt();

            switch (msgType)
            {
                case MessageType.InvokeRequest:
                    await ProcessInvokeRequest(msgId, reader).ConfigureAwait(false);
                    break;
                case MessageType.LoginRequest:
                    await ProcessLoginRequest(msgId, reader).ConfigureAwait(false);
                    break;
                default:
                    Log.Warn("Receive unknown message type.");
                    //TODO: send error response
                    break;
            }
        }
        catch (Exception e)
        {
            Log.Warn($"Read client message error: {e.Message}");
            //TODO:发送响应或关闭连接
        }
        finally
        {
            MessageReadStream.Return(reader);
        }
    }

    private async Task ProcessLoginRequest(int msgId, MessageReadStream reader)
    {
        var user = reader.ReadString();
        var password = reader.ReadString();

        Log.Debug($"收到登录请求: {user}");

        var writer = MessageWriteStream.Rent();
        writer.WriteByte((byte)MessageType.LoginResponse);
        writer.WriteInt(msgId);
        writer.WriteBool(true);
        var data = writer.FinishWrite();
        MessageWriteStream.Return(writer);

        await SendMessage(data).ConfigureAwait(false);
    }

    private async Task ProcessInvokeRequest(int msgId, MessageReadStream reader)
    {
        var service = reader.ReadString();
        var argsCount = reader.ReadVariant();

        Log.Debug($"收到调用请求: {service}");

        var result = AnyValue.From("Hello World");

        var writer = MessageWriteStream.Rent();
        writer.WriteByte((byte)MessageType.InvokeResponse);
        writer.WriteInt(msgId);
        writer.WriteByte((byte)InvokeErrorCode.None);
        writer.Serialize(result);

        var data = writer.FinishWrite();
        MessageWriteStream.Return(writer);

        await SendMessage(data).ConfigureAwait(false);
    }

    private async Task SendMessage(BytesSegment segment)
    {
        ReadOnlySequenceSegment<byte>? cur = segment;
        await _sendLock.WaitAsync();
        try
        {
            while (cur != null && _webSocket.State == WebSocketState.Open)
            {
                await _webSocket.SendAsync(cur.Memory, WebSocketMessageType.Binary,
                    cur.Next == null, CancellationToken.None).ConfigureAwait(false);
                cur = cur.Next;
            }
        }
        catch (Exception e)
        {
            Log.Warn($"Send message to client error: {e.Message}");
        }
        finally
        {
            _sendLock.Release();
        }
    }
}