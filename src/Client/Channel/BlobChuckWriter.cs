using System;
using System.Buffers.Binary;
using System.IO;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using AppBoxCore;

namespace AppBoxClient;

internal readonly struct BlobChuckWriter
{
    public BlobChuckWriter(int msgId, int offset)
    {
        _offset = offset;
        _bytesSegment = BytesSegment.Rent();
        var buffer = _bytesSegment.Buffer;
        buffer[0] = (byte)MessageType.UploadChunk;
        BinaryPrimitives.WriteInt32LittleEndian(buffer.AsSpan(1, 4), msgId);
        BinaryPrimitives.WriteInt32LittleEndian(buffer.AsSpan(5, 4), offset);
    }

    private readonly int _offset;
    private readonly BytesSegment _bytesSegment;
    private const int HeaderSize = 9;

    /// <summary>
    /// 从流中读取数据，如果返回值小于等于0，会自动释放缓存
    /// </summary>
    /// <param name="stream"></param>
    /// <returns>bytes read</returns>
    public async Task<int> ReadChunkDataAsync(Stream stream)
    {
        try
        {
            var bytesRead = await stream.ReadAsync(_bytesSegment.Buffer, HeaderSize,
                _bytesSegment.Buffer.Length - HeaderSize);
            if (bytesRead == 0)
                BytesSegment.ReturnOne(_bytesSegment);
            return bytesRead;
        }
        catch (Exception)
        {
            BytesSegment.ReturnOne(_bytesSegment);
            return -1;
        }
    }
}