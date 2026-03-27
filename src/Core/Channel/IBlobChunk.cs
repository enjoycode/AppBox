namespace AppBoxCore;

public interface IBlobChunk
{
    ReadOnlySpan<byte> GetDataChunk();

    bool IsLastChunk();

    void Free();
}