using AppBoxCore;

namespace AppBoxServer;

internal static class BlobChunkExtensions
{
    public static async Task WriteToFile(this IAsyncEnumerable<IBlobChunk> stream, string filePath)
    {
        var wfs = File.OpenWrite(filePath);
        await foreach (var chunk in stream)
        {
            //TODO: order by offset
            await wfs.WriteAsync(chunk.GetDataChunk());
        }
        await wfs.FlushAsync();
        wfs.Close();
    }
}