using AppBoxCore;

namespace AppBoxServer;

internal static class BlobChunkExtensions
{
    public static async Task WriteToFile(this IAsyncEnumerable<IBlobChunk> stream, string filePath)
    {
        await using var wfs = File.OpenWrite(filePath);
        await foreach (var chunk in stream)
        {
            //TODO: order by offset
            await wfs.WriteAsync(chunk.GetDataChunk());
            chunk.Free(); //Do not forget this
        }

        await wfs.FlushAsync();
    }
}