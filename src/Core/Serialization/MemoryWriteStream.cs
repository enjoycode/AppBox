namespace AppBoxCore;

public sealed class MemoryWriteStream : IOutputStream, IDisposable
{
    public MemoryWriteStream(int capacity = 128)
    {
        _memory = new MemoryStream(capacity);
    }

    private SerializeContext? _context;
    private readonly MemoryStream _memory;

    public byte[] Data
    {
        get
        {
            _memory.Flush();
            return _memory.ToArray();
        }
    }

    public SerializeContext Context => _context ??= new SerializeContext();

    public void WriteByte(byte value) => _memory.WriteByte(value);

    public void WriteBytes(ReadOnlySpan<byte> src) => _memory.Write(src);

    public void Dispose() => _memory.Dispose();
}