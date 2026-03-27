namespace AppBoxCore;

public interface IBlobChunk
{
    ReadOnlyMemory<byte> GetDataChunk();

    bool IsLastChunk(out bool isEmpty);

    void Free();
}