namespace AppBoxCore;

public sealed class SystemReadStream : IInputStream
{
    //TODO: use buffer for read

    public SystemReadStream(Stream stream)
    {
        _stream = stream;
    }

    private readonly Stream _stream;
    private DeserializeContext? _context;

    public DeserializeContext Context => _context ??= new DeserializeContext();

    public bool HasRemaining => _stream.Position < _stream.Length;

    public byte ReadByte()
    {
        var res = _stream.ReadByte();
        if (res == -1) throw new SerializationException(SerializationError.NothingToRead);
        return (byte)res;
    }

    public void ReadBytes(Span<byte> dest)
    {
        var read = _stream.Read(dest);
        if (read != dest.Length)
            throw new SerializationException(SerializationError.NothingToRead);
    }

    public Stream ToSystemStream() => _stream;

    public void Free() => _stream.Dispose();
}