namespace AppBoxCore;

public sealed class MemoryReadStream : IInputStream, IDisposable
{
    public MemoryReadStream(byte[] data)
    {
        _memory = new MemoryStream(data);
    }

    private readonly MemoryStream _memory;

    private DeserializeContext? _context;

    public DeserializeContext Context => _context ??= new DeserializeContext();

    public byte ReadByte()
    {
        var res = _memory.ReadByte();
        if (res == -1) throw new SerializationException(SerializationError.NothingToRead);
        return (byte)res;
    }

    public void ReadBytes(Span<byte> dest)
    {
        var read = _memory.Read(dest);
        if (read != dest.Length)
            throw new SerializationException(SerializationError.NothingToRead);
    }

    public void Dispose() => _memory.Dispose();
}