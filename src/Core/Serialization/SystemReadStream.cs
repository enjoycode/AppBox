namespace AppBoxCore;

public sealed class SystemReadStream : IInputStream
{
    //TODO: use buffer for read

    public SystemReadStream(Stream stream)
    {
        InputStream = stream;
    }

    public readonly Stream InputStream;
    private DeserializeContext? _context;

    public DeserializeContext Context => _context ??= new DeserializeContext();

    public bool HasRemaining => InputStream.Position < InputStream.Length;

    public byte ReadByte()
    {
        var res = InputStream.ReadByte();
        if (res == -1) throw new SerializationException(SerializationError.NothingToRead);
        return (byte)res;
    }

    public void ReadBytes(Span<byte> dest)
    {
        var read = InputStream.Read(dest);
        if (read != dest.Length)
            throw new SerializationException(SerializationError.NothingToRead);
    }

    public Stream ToSystemStream() => InputStream;

    public void Free() => InputStream.Dispose();
}