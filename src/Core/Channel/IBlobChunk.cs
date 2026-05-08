namespace AppBoxCore;

public interface IBlobChunk
{
    ReadOnlyMemory<byte> GetDataChunk();

    int Offset { get; }

    bool IsLastChunk(out bool isEmpty);

    void Free();
}

public static class BlobChunkExtensions
{
    public static async Task WriteToStream(this IAsyncEnumerable<IBlobChunk> chunks, Stream toStream)
    {
        await foreach (var chunk in chunks)
        {
            //暂由上传管理器保证顺序
            try
            {
                await toStream.WriteAsync(chunk.GetDataChunk());
            }
            finally
            {
                chunk.Free(); //Do not forget this
            }
        }

        await toStream.FlushAsync();
    }
    
    public static async Task WriteToFile(this IAsyncEnumerable<IBlobChunk> chunks, string filePath)
    {
        await using var wfs = File.OpenWrite(filePath);
        await chunks.WriteToStream(wfs);
    }
}