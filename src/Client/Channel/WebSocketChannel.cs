using System;
using System.Collections.Concurrent;
using System.IO;
using System.Net.WebSockets;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;
using AppBoxCore;

namespace AppBoxClient;

public sealed class WebSocketChannel : IClientChannel
{
    public WebSocketChannel(Uri serverUri)
    {
        _serverUri = serverUri;
        if (RuntimeInformation.ProcessArchitecture == Architecture.Wasm)
            Task.Run(TryConnect);
    }

    private ClientWebSocket _clientWebSocket = null!;
    private int _connectStatus;
    private Task _connectTask = null!;
    private readonly Uri _serverUri;

    private string? _sessionId;
    private string? _name;
    private int _msgIdIndex;

    public string SessionName => _name ?? string.Empty;
    public string SessionId => _sessionId ?? string.Empty;
    public Guid LeafOrgUnitId { get; private set; } = Guid.Empty;

    private DownloadManager? _downloadManager;

    private readonly ConcurrentDictionary<int, PooledTaskSource<MessageReadStream>> _pendingRequests = new();

    private readonly ObjectPool<PooledTaskSource<MessageReadStream>> _pooledTaskSource =
        PooledTaskSource<MessageReadStream>.Create(8);

    //private readonly ConcurrentDictionary<int, BytesSegment> _pendingResponses = new();
    private BytesSegment? _pendingMsg; //当前未全部接收的消息包

    private int MakePendingRequest(out PooledTaskSource<MessageReadStream> promise)
    {
        var msgId = MakeMsgId();
        promise = _pooledTaskSource.Allocate();
        if (!_pendingRequests.TryAdd(msgId, promise))
        {
            _pooledTaskSource.Free(promise);
            throw new Exception("Can't add pending request");
        }

        return msgId;
    }

    public async Task<AnyValue> Invoke<T>(string service, T args, EntityFactory[]? entityFactories = null)
        where T : struct, IAnyArgs
    {
        //add to wait list
        var msgId = MakePendingRequest(out var promise);

        //serialize request
        var reqData = SerializeRequest(msgId, MessageType.InvokeRequest, service, args);

        // send request and wait for response
        await SendMessage(reqData);
        var rs = await promise.WaitAsync();
        _pooledTaskSource.Free(promise);

        // deserialize response
        return DeserializeResponse(ref rs, entityFactories);
    }

    public async Task Login(string user, string password, string? external)
    {
        //add to wait list
        var msgId = MakePendingRequest(out var promise);

        //serialize request
        var ws = new MessageWriteStream();
        ws.WriteByte((byte)MessageType.LoginRequest);
        ws.WriteInt(msgId);
        ws.WriteString(user);
        ws.WriteString(password);

        // send and wait for response
        var reqData = ws.FinishWrite();
        await SendMessage(reqData);

        var rs = await promise.WaitAsync();
        _pooledTaskSource.Free(promise);

        // deserialize response
        var loginOk = rs.ReadBool();
        if (loginOk)
        {
            _sessionId = rs.ReadString()!;
            _name = rs.ReadString()!;
            LeafOrgUnitId = rs.ReadGuid();
            rs.Free();
        }
        else
        {
            var error = rs.ReadString();
            rs.Free();
            throw new Exception(error);
        }
    }

    public Task Logout()
    {
        throw new NotImplementedException();
    }

    public async Task<AnyValue> Upload<T>(string service, Stream stream, T args)
        where T : struct, IAnyArgs
    {
        //add to wait list
        var msgId = MakePendingRequest(out var promise);

        //serialize request
        var reqData = SerializeRequest(msgId, MessageType.UploadRequest, service, args);

        // send request
        await SendMessage(reqData);
        // send data chunk in other task
        SendBlobChunk(msgId, stream);

        // wait for response
        var rs = await promise.WaitAsync();
        _pooledTaskSource.Free(promise);
        return DeserializeResponse(ref rs, null);
    }

    public async Task Download<T>(string service, Stream stream, T args)
        where T : struct, IAnyArgs
    {
        //add to wait list
        var msgId = MakePendingRequest(out var promise);
        _downloadManager ??= new DownloadManager();
        _downloadManager.MakePendingDownload(msgId, stream);

        //serialize request
        var reqData = SerializeRequest(msgId, MessageType.DownloadRequest, service, args);

        // send request
        await SendMessage(reqData);

        // wait for response
        var rs = await promise.WaitAsync();
        _pooledTaskSource.Free(promise);
        _downloadManager.RemovePending(msgId);
        DeserializeResponse(ref rs, null);
    }

    #region ====Serialization for Request & Response====

    private static AnyValue DeserializeResponse(ref MessageReadStream rs, EntityFactory[]? entityFactories)
    {
        var errorCode = (InvokeErrorCode)rs.ReadByte();
        var result = AnyValue.Empty;
        if (rs.HasRemaining) //因有些错误可能不包含数据，只有错误码
        {
            try
            {
                if (entityFactories != null)
                    rs.Context.SetEntityFactories(entityFactories);
                result = AnyValue.DeserializeFrom(ref rs);
            }
            catch (Exception ex)
            {
                errorCode = InvokeErrorCode.DeserializeResponseFail;
                result = AnyValue.From(ex.Message);
            }
            finally
            {
                rs.Free();
            }
        }

        if (errorCode != InvokeErrorCode.None)
            throw new Exception($"Invoke error: Code={errorCode} Msg={result.GetString()}");

        return result;
    }

    private static BytesSegment SerializeRequest<T>(int msgId, MessageType msgType, string service, T args)
        where T : struct, IAnyArgs
    {
        var ws = new MessageWriteStream();
        BytesSegment reqData;
        try
        {
            ws.WriteByte((byte)msgType);
            ws.WriteInt(msgId);
            ws.WriteString(service);
            args.SerializeTo(ref ws); //serialize request args

            reqData = ws.FinishWrite();
        }
        catch (Exception)
        {
            //must free BytesSegment has written.
            reqData = ws.FinishWrite();
            BytesSegment.ReturnAll(reqData);
            throw;
        }

        return reqData;
    }

    #endregion

    private void NotifyToPendingRequest(int msgId, MessageType msgType, InvokeErrorCode errCode, string? errMsg = null)
    {
        if (_pendingRequests.TryRemove(msgId, out var promise))
        {
            var ws = new MessageWriteStream();
            ws.WriteByte((byte)msgType);
            ws.WriteInt(msgId);
            ws.WriteByte((byte)errCode);
            if (!string.IsNullOrEmpty(errMsg))
                ws.Serialize(errMsg);
            var data = ws.FinishWrite();

            var rs = new MessageReadStream(data.First!);
            rs.ReadByte(); //msgType
            rs.ReadInt(); //msgId
            promise.SetResult(rs);
        }
    }

    private int MakeMsgId() => Interlocked.Increment(ref _msgIdIndex);

    #region ====Connection Methods====

    private async ValueTask TryConnect()
    {
        var oldStatus = Interlocked.CompareExchange(ref _connectStatus, 1, 0);
        if (oldStatus == 0)
        {
            _clientWebSocket = new ClientWebSocket();
            _connectTask = _clientWebSocket.ConnectAsync(_serverUri, CancellationToken.None);
            try
            {
                await _connectTask;
                StartReceive(_clientWebSocket);
                Interlocked.Exchange(ref _connectStatus, 2);
            }
            catch (Exception e)
            {
                Interlocked.Exchange(ref _connectStatus, 0);
                throw new Exception($"Can't connect to websocket: {e.Message}");
            }
        }
        else if (oldStatus == 1)
        {
            await _connectTask;
        }
    }

    private void OnClose(string reason)
    {
        //TODO: clean pending request
        Interlocked.Exchange(ref _connectStatus, 0);
        Console.WriteLine($"Closed by reason: {reason}"); // Log.Info($"Closed by reason: {reason}");
    }

    #endregion

    #region ====Receive Methods====

    private async void StartReceive(WebSocket webSocket)
    {
        //TODO:暂简单实现
        while (webSocket.State == WebSocketState.Open)
        {
            var segment = BytesSegment.Rent();
            WebSocketReceiveResult res;
            try
            {
                res = await webSocket.ReceiveAsync(segment.Buffer, CancellationToken.None);
            }
            catch (Exception e)
            {
                BytesSegment.ReturnOne(segment);
                OnClose($"Websocket receive error: {e.Message}");
                break;
            }

            if (res.MessageType == WebSocketMessageType.Close)
            {
                BytesSegment.ReturnOne(segment);
                OnClose("Websocket receive error: Close");
                break;
            }

            segment.Length = res.Count;
            if (res.EndOfMessage)
            {
                if (_pendingMsg != null)
                {
                    _pendingMsg.Append(segment);
                    _pendingMsg = null;
                }

                var rs = new MessageReadStream(segment.First!);
                var msgType = (MessageType)rs.ReadByte(); //message type
                switch (msgType)
                {
                    case MessageType.InvokeResponse:
                    case MessageType.LoginResponse:
                    case MessageType.UploadResponse:
                    case MessageType.DownloadResponse:
                        ProcessResponse(ref rs); break;
                    case MessageType.DownloadChunk:
                        await ProcessDownloadChunk(rs); break;
                    case MessageType.ServerEvent: ProcessServerEvent(ref rs); break;
                    default:
                        rs.Free();
                        //throw new Exception($"Unknown message type: {msgType}");
                        Console.WriteLine($"Receive unknown message type: {msgType}");
                        break;
                }
            }
            else
            {
                _pendingMsg?.Append(segment);
                _pendingMsg = segment;
            }
        }
    }

    private void ProcessResponse(ref MessageReadStream rs)
    {
        var msgId = rs.ReadInt();
        if (_pendingRequests.TryRemove(msgId, out var promise))
            promise.SetResult(rs);
        else
            rs.Free();
    }

    private async ValueTask ProcessDownloadChunk(MessageReadStream rs)
    {
        var msgId = rs.ReadInt();
        var blobChunk = rs.TakeBlobChunkAndFreeSelf();
        if (_downloadManager == null || !_downloadManager.TryGetPending(msgId, out var stream))
        {
            blobChunk.Free();
            return;
        }

        var isLastChunk = blobChunk.IsLastChunk(out var isEmpty);
        try
        {
            if (!isEmpty)
            {
                await stream.WriteAsync(blobChunk.GetDataChunk());
            }
        }
        catch (Exception e)
        {
            NotifyToPendingRequest(msgId, MessageType.DownloadResponse, InvokeErrorCode.Other,
                $"Can't write download data to stream: {e.Message}");
            return;
        }
        finally
        {
            blobChunk.Free();
        }

        if (isLastChunk)
            NotifyToPendingRequest(msgId, MessageType.DownloadResponse, InvokeErrorCode.None);
    }

    private static void ProcessServerEvent(ref MessageReadStream rs)
    {
        var eventId = rs.ReadInt();
        try
        {
            Channel.RaiseServerEvent(eventId, ref rs);
        }
        catch (Exception e)
        {
            //TODO: forward to ui notification
            Console.WriteLine($"Process server event error: {e.Message}");
        }
        finally
        {
            rs.Free();
        }
    }

    #endregion

    #region ====Send Methods====

    private void SendBlobChunk(int msgId, Stream stream)
    {
        Task.Run(async () =>
        {
            var offset = 0;
            while (_pendingRequests.ContainsKey(msgId) /*should be removed when error*/)
            {
                var chuckWriter = new BlobChuckWriter(msgId, offset, MessageType.UploadChunk);
                var bytesRead = await chuckWriter.WriteChunkDataAsync(stream);
                if (bytesRead < 0)
                {
                    NotifyToPendingRequest(msgId, MessageType.UploadChunk, InvokeErrorCode.SendRequestFail,
                        "Can't send blob chunk");
                    break;
                }

                //可能会发送一个空的chunk(bytesRead == 0)
                await SendMessage(chuckWriter.Chunk);
                if (((IBlobChunk)chuckWriter.Chunk).IsLastChunk(out _))
                    break;

                offset += bytesRead;
            }
        });
    }

    /// <summary>
    /// 发送完整消息包，完成后归还缓存
    /// </summary>
    private async Task SendMessage(BytesSegment data)
    {
        await TryConnect();

        var cur = data;
        do
        {
            var isEnd = cur.Next == null;
            await _clientWebSocket.SendAsync(cur.Memory, WebSocketMessageType.Binary, isEnd, CancellationToken.None);
            if (isEnd) break;
            cur = (BytesSegment)cur.Next!;
        } while (true);

        BytesSegment.ReturnAll(data);
    }

    #endregion
}