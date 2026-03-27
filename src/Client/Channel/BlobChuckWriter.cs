using System;
using System.Buffers.Binary;
using System.IO;
using System.Threading.Tasks;
using AppBoxCore;

namespace AppBoxClient;

internal readonly struct BlobChuckWriter
{
    public BlobChuckWriter(int msgId, int offset)
    {
        Chunk = BytesSegment.Rent();
        var buffer = Chunk.Buffer;
        buffer[0] = (byte)MessageType.UploadChunk;
        BinaryPrimitives.WriteInt32LittleEndian(buffer.AsSpan(1, 4), msgId);
        BinaryPrimitives.WriteInt32LittleEndian(buffer.AsSpan(5, 4), offset);
    }

    public BytesSegment Chunk { get; }

    /// <summary>
    /// 从流中读取数据，如果返回值小于0，会自动释放缓存
    /// </summary>
    /// <param name="stream"></param>
    /// <returns>-1 = read error; other = bytes read</returns>
    public async Task<int> ReadChunkDataAsync(Stream stream)
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