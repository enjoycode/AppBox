using System;
using System.Collections.Generic;
using System.Collections.Concurrent;
using System.Text;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;
using AppBoxCore;

namespace AppBoxClient
{
    public sealed class WebSocketChannel : IChannel
    {
        public WebSocketChannel(Uri serverUri)
        {
            _serverUri = serverUri;
            _clientWebSocket = new ClientWebSocket();
            _ = Task.Run(ConnectAndStartReceive);
        }

        private readonly Uri _serverUri;
        private readonly ClientWebSocket _clientWebSocket;
        private int _sessionId;
        private string? _name;
        private int _msgIdIndex = 0;

        private readonly ConcurrentDictionary<int, TaskCompletionSource<MessageReadStream>>
            _pendingRequests = new();

        //private readonly ConcurrentDictionary<int, BytesSegment> _pendingResponses = new();
        private BytesSegment? _pendingResponse;

        public async Task<object?> Invoke(string service, object?[]? args,
            EntityFactory[]? entityFactories)
        {
            //add to wait list
            var msgId = MakeMsgId();
            var promise =
                new TaskCompletionSource<MessageReadStream>(); //TODO: use CompletionSourcePool
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

            var rs = await promise.Task;
            if (entityFactories != null)
                rs.Context.SetEntityFactories(entityFactories);
            _pendingRequests.TryRemove(msgId, out _);

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
            var promise =
                new TaskCompletionSource<MessageReadStream>(); //TODO: use CompletionSourcePool
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

            var rs = await promise.Task;
            _pendingRequests.TryRemove(msgId, out _);

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

        private async Task ConnectAndStartReceive()
        {
            try
            {
                await _clientWebSocket.ConnectAsync(_serverUri, CancellationToken.None);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Can't connect to uri: {_serverUri} errors:\n{ex.Message}");
                return;
            }

            //TODO:暂简单实现
            while (true)
            {
                var segment = BytesSegment.Rent();
                var res = await _clientWebSocket.ReceiveAsync(segment.Buffer,
                    CancellationToken.None);
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
                    if (_pendingResponse != null)
                    {
                        _pendingResponse.Append(segment);
                    }

                    _pendingResponse = segment;
                }
            }
        }

        private async Task SendMessage(BytesSegment data)
        {
            //TODO: check connection state

            BytesSegment cur = data;
            do
            {
                var isEnd = cur.Next == null;
                await _clientWebSocket.SendAsync(cur.Buffer, WebSocketMessageType.Binary, isEnd,
                    CancellationToken.None);
                if (isEnd)
                    break;
                else
                    cur = (BytesSegment)cur.Next!;
            } while (true);

            BytesSegment.ReturnAll(data);
        }
    }
}