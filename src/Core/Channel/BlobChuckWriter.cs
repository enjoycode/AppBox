using System.Buffers.Binary;

namespace AppBoxCore;

internal readonly struct BlobChuckWriter
{
    public BlobChuckWriter(int msgId, int offset, MessageType msgType)
    {
        Chunk = BytesSegment.Rent();
        var buffer = Chunk.Buffer;
        buffer[0] = (byte)msgType;
        BinaryPrimitives.WriteInt32LittleEndian(buffer.AsSpan(1, 4), msgId);
        BinaryPrimitives.WriteInt32LittleEndian(buffer.AsSpan(5, 4), offset);
    }

    public BytesSegment Chunk { get; }

    /// <summary>
    /// 从流中读取数据，如果返回值小于0，会自动释放缓存
    /// </summary>
    /// <param name="stream"></param>
    /// <returns>-1 = error; other = bytes</returns>
    public async Task<int> WriteChunkDataAsync(Stream stream)
    {
        try
        {
            var bytesRead = await stream.ReadAsync(Chunk.Buffer, BytesSegment.BlobChunkHeaderSize,
                Chunk.Buffer.Length - BytesSegment.BlobChunkHeaderSize);
            Chunk.Length = bytesRead + BytesSegment.BlobChunkHeaderSize;
            return bytesRead;
        }
        catch (Exception)
        {
            BytesSegment.ReturnOne(Chunk);
            return -1;
        }
    }
}