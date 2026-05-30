using System.Buffers.Binary;
using AppBoxCore.Channel;

namespace AppBoxCore;

/// <summary>
/// 用于从流中读取数据包装为Pipe的Segment直接发送
/// </summary>
internal readonly struct StreamToPipeSegmentWriter
{
    public StreamToPipeSegmentWriter(int msgId, int offset, MessageType msgType)
    {
        Segment = BytesSegment.Rent();
        var buffer = Segment.Buffer;
        buffer[0] = (byte)msgType;
        BinaryPrimitives.WriteInt32LittleEndian(buffer.AsSpan(1, 4), msgId);
        BinaryPrimitives.WriteInt32LittleEndian(buffer.AsSpan(5, 4), offset);
    }

    public BytesSegment Segment { get; }

    /// <summary>
    /// 从流中读取数据，如果返回值小于0，会自动释放缓存
    /// </summary>
    /// <param name="stream"></param>
    /// <returns>-1 = error; other = bytes</returns>
    public async ValueTask<int> WriteSegmentAsync(Stream stream)
    {
        try
        {
            var memory = Segment.Buffer.AsMemory(PipeSegmentHeader.HeaderSize);
            var bytesRead = await stream.ReadAsync(memory);
            Segment.Length = bytesRead + PipeSegmentHeader.HeaderSize;
            return bytesRead;
        }
        catch (Exception)
        {
            BytesSegment.ReturnOne(Segment);
            return -1;
        }
    }
}