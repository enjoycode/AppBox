using AppBoxCore.Channel;

namespace AppBoxCore;

public interface IChannel
{
    /// <summary>
    /// 用于流式发送缓冲块，不保证顺序，由接收端按序组合
    /// </summary>
    /// <remarks>
    /// 发送异常通知PipeWriter中止
    /// </remarks>
    void SendPipeSegment(BytesPipeWriter pipe, BytesSegment segment);
}