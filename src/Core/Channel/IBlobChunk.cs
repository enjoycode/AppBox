namespace AppBoxCore;

public interface IBlobChunk
{
    ReadOnlyMemory<byte> GetDataChunk();

    int Offset { get; }

    bool IsLastChunk(out bool isEmpty);

    void Free();
}