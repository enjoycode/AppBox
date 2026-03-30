using System.Buffers;
using System.Net.WebSockets;
using AppBoxCore;
using AppBoxServer;
using static AppBoxServer.ServerLogger;

namespace AppBoxWebHost;

internal sealed class WebSocketClient(WebSocket webSocket) : IRemoteChannel
{
    internal WebSession? WebSession { get; set; }

    private BytesSegment? _pending;
    private readonly SemaphoreSlim _sendLock = new(1, 1);
    private UploadManager? _uploadManager;

    /// <summary>
    /// 组合并处理收到的消息
    /// </summary>
    internal async ValueTask OnReceiveMessage(BytesSegment frame, bool isEnd)
    {
        //TODO:1.严格检查frame有效性；2.ShortPath for UploadChunk frame
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
        try
        {
            var msgType = (MessageType)reader.ReadByte();
            var msgId = reader.ReadInt();

            //TODO: Process on thread pool, do not await
            switch (msgType)
            {
                case MessageType.InvokeRequest:
                    await ProcessInvokeRequest(msgId, reader).ConfigureAwait(false);
                    break;
                case MessageType.LoginRequest:
                    await ProcessLoginRequest(msgId, reader).ConfigureAwait(false);
                    break;
                case MessageType.UploadRequest:
                    await ProcessUploadRequest(msgId, reader).ConfigureAwait(false);
                    break;
                case MessageType.UploadChunk:
                    await ProcessUploadChunk(msgId, reader).ConfigureAwait(false);
                    break;
                default:
                    Logger.Warn($"Receive unknown message type: {msgType}");
                    //TODO: should send error response
                    break;
            }
        }
        catch (SerializationException se)
        {
            Logger.Warn($"Read client message error: {se.Error}\n{se.StackTrace}");
        }
        catch (Exception e)
        {
            Logger.Warn($"Read client message error: {e.Message}\n{e.StackTrace}");
            //TODO:发送响应或关闭连接
        }
    }

    private async Task ProcessLoginRequest(int msgId, MessageReadStream reader)
    {
        //读取请求消息
        var user = reader.ReadString()!;
        var pass = reader.ReadString()!;
        MessageReadStream.Return(reader);

        //调用系统服务进行验证
        TreePath? result = null;
        string? errorInfo = null;
        try
        {
            result = await SystemService.Login(user, pass);
            Logger.Info($"[{user}]登录成功.");
        }
        catch (Exception e)
        {
            errorInfo = e.Message;
            Logger.Warn($"用户登录失败: {e.Message}");
        }

        //登录成功创建并注册会话
        if (errorInfo == null)
        {
            WebSession = new WebSession(result!, user, this);
            WebSocketManager.RegisterSession(this, WebSession);
        }

        //发送响应
        var writer = MessageWriteStream.Rent();
        writer.WriteByte((byte)MessageType.LoginResponse);
        writer.WriteInt(msgId);
        writer.WriteBool(errorInfo == null);
        if (errorInfo == null)
        {
            writer.WriteString(WebSession!.SessionId);
            writer.WriteString(WebSession.Name);
            writer.WriteGuid(WebSession.LeafOrgUnitId);
        }
        else
        {
            writer.WriteString(errorInfo);
        }

        var data = writer.FinishWrite();
        MessageWriteStream.Return(writer);

        await SendMessage(data).ConfigureAwait(false);
    }

    private Task ProcessInvokeRequest(int msgId, MessageReadStream reader)
    {
        //设置当前会话
        HostRuntimeContext.SetCurrentSession(WebSession);

        //调用服务
        return InvokeInternal(msgId, reader, MessageType.InvokeResponse, AnyArgs.From(reader));
    }

    private async Task ProcessUploadRequest(int msgId, MessageReadStream reader)
    {
        //设置当前会话
        HostRuntimeContext.SetCurrentSession(WebSession);

        _uploadManager ??= new UploadManager();
        var pendingUpload = _uploadManager.MakePendingUpload(msgId);

        //调用上传服务 TODO:超时处理，如客户端意外掉线
        try
        {
            await InvokeInternal(msgId, reader, MessageType.UploadResponse,
                new UploadArgs(pendingUpload.Channel.Reader.ReadAllAsync(), reader));
        }
        finally
        {
            //清除挂起的上传
            _uploadManager.RemovePending(msgId);
        }
    }

    private async ValueTask ProcessUploadChunk(int msgId, MessageReadStream reader)
    {
        var blobChunk = reader.TakeBlobChunk();

        if (_uploadManager == null || !_uploadManager.TryGetPending(msgId, out var pendingUpload))
        {
            blobChunk.Free();
            Logger.Warn("Receive unknown upload data chunk");
            return;
        }

        //写入Channel,并判断是否最后一块
        var isLastChunk = blobChunk.IsLastChunk(out var isEmpty);
        if (!isEmpty)
        {
            try
            {
                await pendingUpload.Channel.Writer.WriteAsync(blobChunk);
            }
            catch (Exception e)
            {
                Logger.Warn($"Can't write upload data chunk: {e.Message}");
                blobChunk.Free();
            }
        }
        else
            blobChunk.Free();

        if (isLastChunk)
            pendingUpload.Channel.Writer.Complete();
    }

    private async Task InvokeInternal<T>(int msgId, MessageReadStream rs, MessageType msgType, T args)
        where T : struct, IAnyArgs
    {
        //调用服务
        AnyValue result;
        var service = "";
        var errorCode = InvokeErrorCode.None;
        try
        {
            service = rs.ReadString()!;
            Logger.Debug($"Invoke service: {service}");

            result = await ServiceContainer.InvokeAsync(service, args);
        }
        catch (Exception e)
        {
            errorCode = ExceptionToErrorCode(e);
            result = e.Message;
            Logger.Error($"Invoke service[{service}] error[{errorCode}]: {e.Message}\n{e.StackTrace}");
        }

        //序列化并发送响应
        var writer = MessageWriteStream.Rent();
        var writeError = false;
        try
        {
            writer.WriteByte((byte)msgType);
            writer.WriteInt(msgId);
            writer.WriteByte((byte)errorCode);
            writer.Serialize(result);
        }
        catch (Exception e) //序列化响应异常
        {
            writeError = true;
            Logger.Warn($"Serialize InvokeResponse error: {e.Message}");
        }

        var data = writer.FinishWrite();
        MessageWriteStream.Return(writer);
        if (writeError)
        {
            BytesSegment.ReturnAll(data); //释放写错误的数据
            await SendErrorResponse(msgId, MessageType.InvokeResponse, InvokeErrorCode.SerializeResponseFail);
        }
        else
        {
            await SendMessage(data).ConfigureAwait(false);
        }
    }

    private static InvokeErrorCode ExceptionToErrorCode(Exception e) => e switch
    {
        ServicePathException => InvokeErrorCode.ServiceNotExists,
        SerializationException => InvokeErrorCode.DeserializeRequestFail,
        ServiceNotExistsException => InvokeErrorCode.ServiceNotExists,
        _ => InvokeErrorCode.ServiceInnerError
    };

    private async Task SendErrorResponse(int msgId, MessageType msgType, InvokeErrorCode errCode, string? errMsg = null)
    {
        var writer = MessageWriteStream.Rent();
        writer.WriteByte((byte)msgType);
        writer.WriteInt(msgId);
        writer.WriteByte((byte)errCode);
        if (!string.IsNullOrEmpty(errMsg))
            writer.Serialize(errMsg);
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
            while (cur != null && webSocket.State == WebSocketState.Open)
            {
                await webSocket.SendAsync(cur.Memory, WebSocketMessageType.Binary,
                    cur.Next == null, CancellationToken.None).ConfigureAwait(false);
                cur = cur.Next;
            }
        }
        catch (Exception e)
        {
            Logger.Warn($"Send message to client error: {e.Message}");
        }
        finally
        {
            _sendLock.Release();
            BytesSegment.ReturnAll(segment);
        }
    }

    /// <summary>
    /// 发送服务端事件至客户端
    /// </summary>
    public Task SendServerEvent<T>(int eventId, T args) where T : struct, IAnyArgs
    {
        var writer = MessageWriteStream.Rent();
        var writeError = false;
        try
        {
            writer.WriteByte((byte)MessageType.ServerEvent);
            writer.WriteInt(eventId);
            args.SerializeTo(writer);
        }
        catch (Exception e) //序列化响应异常
        {
            writeError = true;
            Logger.Warn($"Serialize ServerEvent error: {e.Message}");
        }
        finally
        {
            args.Free();
        }

        var data = writer.FinishWrite();
        MessageWriteStream.Return(writer);

        if (writeError)
        {
            BytesSegment.ReturnAll(data); //释放写错误的数据
            return Task.CompletedTask; //TODO: should throw exception
        }

        return SendMessage(data);
    }

    internal void OnClosed()
    {
        _uploadManager?.OnClosed();
    }
}