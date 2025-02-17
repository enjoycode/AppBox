using System;
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;
using AppBoxCore;

namespace AppBoxClient;

public sealed class WebSocketChannel : IChannel
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
    private BytesSegment? _pendingResponse;

    public async Task<IInputStream> Invoke(string service, Action<IOutputStream>? argsWriter)
    {
        //add to wait list
        var msgId = MakeMsgId();
        var promise = _pooledTaskSource.Allocate();
        _pendingRequests.TryAdd(msgId, promise);

        //serialize request header
        var ws = MessageWriteStream.Rent();
        BytesSegment reqData;
        try
        {
            ws.WriteByte((byte)MessageType.InvokeRequest);
            ws.WriteInt(msgId);
            ws.WriteString(service);
            //serialize request args
            argsWriter?.Invoke(ws);

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

        // send request and wait for response
        await SendMessage(reqData);
        var rs = await promise.WaitAsync();

        _pendingRequests.TryRemove(msgId, out _);
        _pooledTaskSource.Free(promise);
        return rs;
    }

    public async Task Login(string user, string password, string? external)
    {
        //add to wait list
        var msgId = MakeMsgId();
        var promise = _pooledTaskSource.Allocate();
        _pendingRequests.TryAdd(msgId, promise);

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
        _pendingRequests.TryRemove(msgId, out _);
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
                if (_pendingResponse != null)
                {
                    _pendingResponse.Append(segment);
                    _pendingResponse = null;
                }

                var rs = MessageReadStream.Rent(segment.First!);
                _ = rs.ReadByte(); //message type
                var msgId = rs.ReadInt();
                if (_pendingRequests.TryGetValue(msgId, out var promise))
                    promise.SetResult(rs);
                else
                    MessageReadStream.Return(rs);
            }
            else
            {
                _pendingResponse?.Append(segment);
                _pendingResponse = segment;
            }
        }
    }

    private void OnClose(string reason)
    {
        // Log.Info($"Closed by reason: {reason}");
        //TODO: clean pending request
        Interlocked.Exchange(ref _connectStatus, 0);
    }

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