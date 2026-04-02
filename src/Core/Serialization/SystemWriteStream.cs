namespace AppBoxCore;

public sealed class SystemWriteStream : IOutputStream
{
    public SystemWriteStream(Stream stream)
    {
        _fileStream = stream;
    }

    private readonly Stream _fileStream;
    private SerializeContext? _context;

    public SerializeContext Context => _context ??= new SerializeContext();

    public void WriteByte(byte value) => _fileStream.WriteByte(value);

    public void WriteBytes(ReadOnlySpan<byte> src) => _fileStream.Write(src);

    public void Flush() => _fileStream.Flush();
    public Task FlushAsync() => _fileStream.FlushAsync();
}