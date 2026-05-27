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
        //先读消息头
        var first = frame.First!;
        if (first.Length < 5)
        {
            BytesSegment.ReturnAll(first);
            Logger.Warn($"Read message header error");
            return;
        }

        var reader = new MessageReadStream(first);
        var msgType = (MessageType)reader.ReadByte();
        var msgId = reader.ReadInt();

        //根据消息类型处理 Process on thread pool
        switch (msgType)
        {
            case MessageType.InvokeRequest:
                ProcessInvokeRequest(msgId, reader);
                break;
            case MessageType.LoginRequest:
                ProcessLoginRequest(msgId, reader);
                break;
            case MessageType.UploadRequest:
                ProcessUploadRequest(msgId, reader);
                break;
            case MessageType.UploadChunk:
                await ProcessUploadChunk(msgId, reader); //暂在这里await以保证顺序，可考虑在UploadManager内排序
                break;
            case MessageType.DownloadRequest:
                ProcessDownloadRequest(msgId, reader);
                break;
            default:
                reader.Free();
                Logger.Warn($"Receive unknown message type: {msgType}");
                break;
        }
    }

    private async void ProcessLoginRequest(int msgId, MessageReadStream reader)
    {
        //读取请求消息
        string user;
        string pass;
        try
        {
            user = reader.ReadString()!;
            pass = reader.ReadString()!;
        }
        finally
        {
            reader.Free();
        }

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
        var writer = new MessageWriteStream();
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

        await SendMessage(data).ConfigureAwait(false);
    }

    private async void ProcessInvokeRequest(int msgId, MessageReadStream reader)
    {
        //设置当前会话
        HostRuntimeContext.SetCurrentSession(WebSession);
        //调用服务
        var res = TryReadService(ref reader, out var service);
        if (res == InvokeErrorCode.None)
        {
            var (result, errorCode) = await InvokeInternal(service, AnyArgs.From(reader));
            //发送响应
            await SendResponse(msgId, MessageType.InvokeResponse, errorCode, result);
        }
        else
        {
            //发送错误响应
            await SendErrorResponse(msgId, MessageType.InvokeResponse, res);
        }
    }

    private async void ProcessUploadRequest(int msgId, MessageReadStream reader)
    {
        //设置当前会话
        HostRuntimeContext.SetCurrentSession(WebSession);

        _uploadManager ??= new UploadManager();
        var pendingUpload = _uploadManager.MakePendingUpload(msgId);

        //调用上传服务并等待服务处理完上传的数据后发送响应 TODO:超时处理，如客户端意外掉线
        try
        {
            var res = TryReadService(ref reader, out var service);
            if (res == InvokeErrorCode.None)
            {
                var (result, errCode) = await InvokeInternal(service,
                    new UploadArgs<MessageReadStream>(pendingUpload.Channel.Reader.ReadAllAsync(), reader));
                await SendResponse(msgId, MessageType.UploadResponse, errCode, result);
            }
            else
            {
                await SendErrorResponse(msgId, MessageType.UploadResponse, res);
            }
        }
        finally
        {
            //清除挂起的上传
            _uploadManager.RemovePending(msgId);
        }
    }

    private async ValueTask ProcessUploadChunk(int msgId, MessageReadStream reader)
    {
        var blobChunk = reader.TakeBlobChunkAndFreeSelf();

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

    private async void ProcessDownloadRequest(int msgId, MessageReadStream reader)
    {
        //设置当前会话
        HostRuntimeContext.SetCurrentSession(WebSession);

        //调用下载服务获取数据流
        var res = TryReadService(ref reader, out var service);
        if (res == InvokeErrorCode.None)
        {
            var (result, errCode) = await InvokeInternal(service, AnyArgs.From(reader));
            //如果有错误直接发送响应
            if (errCode != InvokeErrorCode.None)
            {
                await SendResponse(msgId, MessageType.DownloadResponse, errCode, result);
                return;
            }

            //根据服务返回结果发送数据块，目前仅支持Stream
            if (result.BoxedValue is not Stream stream)
            {
                await SendErrorResponse(msgId, MessageType.DownloadResponse, InvokeErrorCode.ServiceInnerError,
                    "Download service return none stream");
                return;
            }

            //开始发送数据块
            try
            {
                var offset = 0;
                while (true)
                {
                    var chuckWriter = new BlobChuckWriter(msgId, offset, MessageType.DownloadChunk);
                    var bytesRead = await chuckWriter.WriteChunkDataAsync(stream);
                    if (bytesRead < 0)
                    {
                        await SendErrorResponse(msgId, MessageType.DownloadResponse, InvokeErrorCode.ServiceInnerError,
                            "Can't read blob chunk");
                        break;
                    }

                    //可能会发送一个空的chunk(bytesRead == 0)
                    await SendMessage(chuckWriter.Chunk);
                    if (((IBlobChunk)chuckWriter.Chunk).IsLastChunk(out _))
                        break;

                    offset += bytesRead;
                }
            }
            finally
            {
                await stream.DisposeAsync();
            }
        }
        else
        {
            await SendErrorResponse(msgId, MessageType.DownloadResponse, res);
        }
    }

    /// <summary>
    /// 读取调用服务的名称，异常直接释放读缓存
    /// </summary>
    private static InvokeErrorCode TryReadService(ref MessageReadStream rs, out string service)
    {
        try
        {
            service = rs.ReadString()!;
            Logger.Debug($"Invoke service: {service}");
            return InvokeErrorCode.None;
        }
        catch (Exception e)
        {
            rs.Free();
            service = string.Empty;
            var errorCode = ExceptionToErrorCode(e);
            Logger.Error($"Read service error[{errorCode}]: {e.Message}");
            return errorCode;
        }
    }

    /// <summary>
    /// 调用服务, 参数由被调用者释放
    /// </summary>
    private static async ValueTask<(AnyValue, InvokeErrorCode)> InvokeInternal<T>(string service, T args)
        where T : struct, IAnyArgs
    {
        //调用服务
        AnyValue result;
        var errorCode = InvokeErrorCode.None;
        try
        {
            result = await ServiceContainer.InvokeAsync(service, args);
        }
        catch (Exception e)
        {
            errorCode = ExceptionToErrorCode(e);
            result = e.Message;
            Logger.Error($"Invoke service[{service}] error[{errorCode}]: {e.Message}\n{e.StackTrace}");
        }

        return (result, errorCode);
    }

    #region ====Send Methods====

    private static InvokeErrorCode ExceptionToErrorCode(Exception e) => e switch
    {
        ServicePathException => InvokeErrorCode.ServiceNotExists,
        SerializationException => InvokeErrorCode.DeserializeRequestFail,
        ServiceNotExistsException => InvokeErrorCode.ServiceNotExists,
        _ => InvokeErrorCode.ServiceInnerError
    };

    private async Task SendResponse(int msgId, MessageType msgType, InvokeErrorCode errorCode, AnyValue result)
    {
        var writer = new MessageWriteStream();
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
            Logger.Warn($"Serialize response error: {e.Message}");
        }

        var data = writer.FinishWrite();
        if (writeError)
        {
            BytesSegment.ReturnAll(data); //释放写错误的数据
            await SendErrorResponse(msgId, msgType, InvokeErrorCode.SerializeResponseFail);
        }
        else
        {
            await SendMessage(data).ConfigureAwait(false);
        }
    }

    private async Task SendErrorResponse(int msgId, MessageType msgType, InvokeErrorCode errCode, string? errMsg = null)
    {
        var writer = new MessageWriteStream();
        writer.WriteByte((byte)msgType);
        writer.WriteInt(msgId);
        writer.WriteByte((byte)errCode);
        if (!string.IsNullOrEmpty(errMsg))
            writer.Serialize(errMsg);
        var data = writer.FinishWrite();
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
        var writer = new MessageWriteStream();
        var writeError = false;
        try
        {
            writer.WriteByte((byte)MessageType.ServerEvent);
            writer.WriteInt(eventId);
            args.SerializeTo(ref writer);
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
        if (writeError)
        {
            BytesSegment.ReturnAll(data); //释放写错误的数据
            return Task.CompletedTask; //TODO: should throw exception
        }

        return SendMessage(data);
    }

    #endregion

    internal void OnClosed()
    {
        _uploadManager?.OnClosed();
    }
}