using System.Net.WebSockets;
using AppBoxCore;

namespace AppBoxWebHost;

internal sealed class WebSocketClient
{
    private readonly WebSocket _webSocket;
    private BytesSegment? _pending;
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

        //开始读取消息
        // var msgId = 0;
        // string service = null; //TODO:优化不创建string
        // var offset = 0; //偏移量至参数数组开始，不包含[Token
        // Exception requireError = null;
        // try
        // {
        //     offset = InvokeHelper.ReadRequireHead(frame.First, ref msgId, ref service);
        //     if (offset == -1) //没有参数
        //         BytesSegment.ReturnOne(frame);
        // }
        // catch (Exception ex)
        // {
        //     requireError = ex;
        //     BytesSegment.ReturnAll(frame); //读消息头异常归还缓存块
        // }
        //
        // if (requireError != null)
        // {
        //     Log.Warn(string.Format("收到无效的Api调用请求: {0}", requireError.Message));
        //     await SendInvokeResponse(msgId, AnyValue.From(requireError));
        //     return;
        // }
        //
        // _ = ProcessInvokeRequire(msgId, service, frame, offset); //no need await
    }
}