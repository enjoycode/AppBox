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
        return DeserializeResponse(rs, entityFactories);
    }

    public async Task Login(string user, string password, string? external)
    {
        //add to wait list
        var msgId = MakePendingRequest(out var promise);

        //serialize request
        var ws = MessageWriteStream.Rent();
        ws.WriteByte((byte)MessageType.LoginRequest);
        ws.WriteInt(msgId);
        ws.WriteString(user);
        ws.WriteString(password);

        // send and wait for response
        var reqData = ws.FinishWrite();
        MessageWriteStream.Return(ws);
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
            MessageReadStream.Return(rs);
        }
        else
        {
            var error = rs.ReadString();
            MessageReadStream.Return(rs);
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
        return DeserializeResponse(rs, null);
    }

    public async Task Download<T>(string service, Stream stream, T args)
        where T : struct, IAnyArgs { }

    #region ====Serialization for Request & Response====

    private static AnyValue DeserializeResponse(MessageReadStream rs, EntityFactory[]? entityFactories)
    {
        var errorCode = (InvokeErrorCode)rs.ReadByte();
        var result = AnyValue.Empty;
        if (rs.HasRemaining) //因有些错误可能不包含数据，只有错误码
        {
            try
            {
                if (entityFactories != null)
                    rs.Context.SetEntityFactories(entityFactories);
                result = AnyValue.DeserializeFrom(rs);
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
        var ws = MessageWriteStream.Rent();
        BytesSegment reqData;
        try
        {
            ws.WriteByte((byte)msgType);
            ws.WriteInt(msgId);
            ws.WriteString(service);
            args.SerializeTo(ws); //serialize request args

            reqData = ws.FinishWrite();
        }
        catch (Exception)
        {
            //must free BytesSegment has written.
            reqData = ws.FinishWrite();
            BytesSegment.ReturnAll(reqData);
            throw;
        }
        finally
        {
            MessageWriteStream.Return(ws);
        }

        return reqData;
    }

    #endregion

    private void SendBlobChunk(int msgId, Stream stream)
    {
        Task.Run(async () =>
        {
            var offset = 0;
            while (_pendingRequests.ContainsKey(msgId) /*should be removed when error*/)
            {
                var reader = new BlobChuckWriter(msgId, offset);
                var bytesRead = await reader.ReadChunkDataAsync(stream);
                if (bytesRead < 0)
                {
                    NotifyErrorToPendingRequest(msgId, MessageType.UploadChunk, InvokeErrorCode.SendRequestFail,
                        "Can't send blob chunk");
                    break;
                }

                //这里不做是否最后一块chunk的判断，可能会发送一个空的chunk给服务端(bytesRead == 0)
                await SendMessage(reader.Chunk);

                offset += bytesRead;
            }
        });
    }

    private void NotifyErrorToPendingRequest(int msgId, MessageType msgType, InvokeErrorCode errCode, string errMsg)
    {
        if (_pendingRequests.TryRemove(msgId, out var promise))
        {
            var ws = MessageWriteStream.Rent();
            ws.WriteByte((byte)msgType);
            ws.WriteInt(msgId);
            ws.WriteByte((byte)errCode);
            ws.Serialize(errMsg);
            var data = ws.FinishWrite();
            MessageWriteStream.Return(ws);

            var rs = MessageReadStream.Rent(data.First!);
            rs.ReadByte(); //msgType
            rs.ReadInt(); //msgId
            promise.SetResult(rs);
        }
    }

    private int MakeMsgId() => Interlocked.Increment(ref _msgIdIndex);

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

                var rs = MessageReadStream.Rent(segment.First!);
                var msgType = (MessageType)rs.ReadByte(); //message type
                if (msgType != MessageType.ServerEvent)
                {
                    var msgId = rs.ReadInt();
                    if (_pendingRequests.TryRemove(msgId, out var promise))
                        promise.SetResult(rs);
                    else
                        rs.Free();
                }
                else
                {
                    var eventId = rs.ReadInt();
                    try
                    {
                        Channel.RaiseServerEvent(eventId, rs);
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
            }
            else
            {
                _pendingMsg?.Append(segment);
                _pendingMsg = segment;
            }
        }
    }

    private void OnClose(string reason)
    {
        // Log.Info($"Closed by reason: {reason}");
        //TODO: clean pending request
        Interlocked.Exchange(ref _connectStatus, 0);
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
}