namespace AppBoxCore;

public sealed class FileReadStream : IInputStream, IDisposable
{
    public FileReadStream(string filePath)
    {
        _fileStream = File.OpenRead(filePath);
    }

    private readonly FileStream _fileStream;
    private DeserializeContext? _context;

    public DeserializeContext Context => _context ??= new DeserializeContext();

    public bool HasRemaining => _fileStream.Position < _fileStream.Length;

    public byte ReadByte()
    {
        var res = _fileStream.ReadByte();
        if (res == -1) throw new SerializationException(SerializationError.NothingToRead);
        return (byte)res;
    }

    public void ReadBytes(Span<byte> dest)
    {
        var read = _fileStream.Read(dest);
        if (read != dest.Length)
            throw new SerializationException(SerializationError.NothingToRead);
    }

    public void Free() => _fileStream.Dispose();

    public Stream ToSystemStream() => _fileStream;

    public void Dispose() => _fileStream.Dispose();
}