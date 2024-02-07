using System;
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;
using AppBoxCore;

namespace AppBoxClient;

public sealed class WebSocketChannel : IChannel
{
    public WebSocketChannel(Uri serverUri)
    {
            _serverUri = serverUri;
            Task.Run(TryConnect);
        }

    private ClientWebSocket _clientWebSocket = null!;
    private int _connectStatus = 0;
    private Task _connectTask = null!;
    private readonly Uri _serverUri;

    private int _sessionId;
    private string? _name;
    private int _msgIdIndex = 0;

    private readonly ConcurrentDictionary<int, PooledTaskSource<MessageReadStream>> _pendingRequests = new();

    private readonly ObjectPool<PooledTaskSource<MessageReadStream>> _pooledTaskSource =
        PooledTaskSource<MessageReadStream>.Create(8);

    //private readonly ConcurrentDictionary<int, BytesSegment> _pendingResponses = new();
    private BytesSegment? _pendingResponse;

    public async Task<object?> Invoke(string service, object?[]? args, EntityFactory[]? entityFactories)
    {
            //add to wait list
            var msgId = MakeMsgId();
            var promise = _pooledTaskSource.Allocate();
            _pendingRequests.TryAdd(msgId, promise);

            //serialize request
            var ws = MessageWriteStream.Rent();
            ws.WriteByte((byte)MessageType.InvokeRequest);
            ws.WriteInt(msgId);
            ws.WriteString(service);
            if (args != null && args.Length > 0)
            {
                for (var i = 0; i < args.Length; i++)
                {
                    ws.Serialize(args[i]);
                }
            }

            // send and wait for response
            var reqData = ws.FinishWrite();
            MessageWriteStream.Return(ws);
            await SendMessage(reqData);

            var rs = await promise.WaitAsync();
            if (entityFactories != null)
                rs.Context.SetEntityFactories(entityFactories);
            _pendingRequests.TryRemove(msgId, out _);
            _pooledTaskSource.Free(promise);

            // deserialize response
            var errorCode = (InvokeErrorCode)rs.ReadByte();
            object? result = null;
            if (rs.HasRemaning) //因有些错误可能不包含数据，只有错误码
            {
                try
                {
                    result = rs.Deserialize();
                }
                catch (Exception ex)
                {
                    errorCode = InvokeErrorCode.DeserializeResponseFail;
                    result = ex.Message;
                }
                finally
                {
                    MessageReadStream.Return(rs);
                }
            }

            if (errorCode != InvokeErrorCode.None)
                throw new Exception($"Code={errorCode} Msg={result}");
            return result;
        }

    public async Task Login(string user, string password, object? external)
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
                _sessionId = rs.ReadInt();
                _name = rs.ReadString()!;
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
            Log.Info($"Closed by reason: {reason}");
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
                await _clientWebSocket.SendAsync(cur.Memory, WebSocketMessageType.Binary, isEnd,
                    CancellationToken.None);
                if (isEnd)
                    break;
                cur = (BytesSegment)cur.Next!;
            } while (true);

            BytesSegment.ReturnAll(data);
        }
}