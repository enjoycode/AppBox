using AppBoxCore.Channel;

namespace AppBoxCore;

public interface IChannel
{
    /// <summary>
    /// 用于流式发送缓冲块(不管是否发送成功都归还缓存)，不保证顺序，由接收端按序组合
    /// </summary>
    /// <remarks>
    /// 发送异常通知PipeWriter中止并通知挂起的请求异常
    /// </remarks>
    void SendPipeSegment(BytesPipeWriter pipe, BytesSegment segment);
}