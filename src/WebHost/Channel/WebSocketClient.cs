using System.Buffers;
using System.Net.WebSockets;
using AppBoxClient;
using AppBoxCore;
using AppBoxServer;

namespace AppBoxWebHost;

internal sealed class WebSocketClient
{
    private readonly WebSocket _webSocket;
    internal WebSession? WebSession { get; set; }

    private BytesSegment? _pending;
    private readonly SemaphoreSlim _sendLock = new SemaphoreSlim(1, 1);

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
    }

    private async Task ProcessLoginRequest(int msgId, MessageReadStream reader)
    {
        //读取请求消息
        var user = reader.ReadString()!;
        var pass = reader.ReadString()!;
        MessageReadStream.Return(reader);
        Log.Debug($"收到用户登录请求: {user}");

        //调用系统服务进行验证
        TreePath? result = null;
        string? errorInfo = null;
        try
        {
            result = await SysServiceContainer.SystemService.Login(user, pass);
        }
        catch (Exception e)
        {
            errorInfo = e.Message;
            Log.Warn($"用户登录失败: {e.Message}");
        }

        //登录成功创建并注册会话
        if (errorInfo == null)
        {
            var sessionId = StringUtil.GetHashCode(user); //TODO:暂Hash得到会话标识
            WebSession = new WebSession(result!, sessionId);
            WebSocketManager.RegisterSession(this, WebSession);
        }

        //发送响应
        var writer = MessageWriteStream.Rent();
        writer.WriteByte((byte)MessageType.LoginResponse);
        writer.WriteInt(msgId);
        writer.WriteBool(errorInfo == null);
        if (errorInfo == null)
        {
            writer.WriteInt(WebSession!.SessionId);
            writer.WriteString(WebSession.Name);
            //TODO:考虑写入员工标识
        }
        else
        {
            writer.WriteString(errorInfo);
        }

        var data = writer.FinishWrite();
        MessageWriteStream.Return(writer);

        await SendMessage(data).ConfigureAwait(false);
    }

    private async Task ProcessInvokeRequest(int msgId, MessageReadStream reader)
    {
        //设置当前会话
        HostRuntimeContext.SetCurrentSession(WebSession);

        //调用服务
        var result = AnyValue.Empty;
        var errorCode = InvokeErrorCode.None;
        try
        {
            var service = reader.ReadString()!;
            Log.Debug($"收到调用请求: {service}");

            result = await RuntimeContext.InvokeAsync(service, InvokeArgs.From(reader));
        }
        catch (Exception e)
        {
            errorCode = e switch
            {
                ServicePathException => InvokeErrorCode.DeserializeRequestFail,
                SerializationException => InvokeErrorCode.DeserializeRequestFail,
                ServiceNotExistsException => InvokeErrorCode.ServiceNotExists,
                _ => InvokeErrorCode.ServiceInnerError
            };
            Log.Warn($"Invoke service error[{errorCode}]: {e.Message}");
        }

        //序列化并发送响应
        var writer = MessageWriteStream.Rent();
        var writeError = false;
        try
        {
            writer.WriteByte((byte)MessageType.InvokeResponse);
            writer.WriteInt(msgId);
            writer.WriteByte((byte)errorCode);
            writer.Serialize(result);
        }
        catch (Exception e) //序列化响应异常
        {
            writeError = true;
            Log.Warn($"Serialize InvokeResponse error: {e.Message}");
        }

        var data = writer.FinishWrite();
        MessageWriteStream.Return(writer);
        if (writeError)
        {
            BytesSegment.ReturnAll(data); //释放写错误的数据
            await SendInvokeResponseWithSerializeError(msgId);
        }
        else
        {
            await SendMessage(data).ConfigureAwait(false);
        }
    }

    private async Task SendInvokeResponseWithSerializeError(int msgId)
    {
        var writer = MessageWriteStream.Rent();
        writer.WriteByte((byte)MessageType.InvokeResponse);
        writer.WriteInt(msgId);
        writer.WriteByte((byte)InvokeErrorCode.SerializeResponseFail);
        var data = writer.FinishWrite();
        MessageWriteStream.Return(writer);
        await SendMessage(data);
    }

    /// <summary>
    /// 发送消息，完成后释放缓存
    /// </summary>
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
            BytesSegment.ReturnAll(segment);
        }
    }
}