namespace AppBoxCore;

public sealed class FileWriteStream : IOutputStream, IDisposable
{
    public FileWriteStream(string filePath)
    {
        _fileStream = File.OpenWrite(filePath);
    }

    private readonly FileStream _fileStream;
    private SerializeContext? _context;

    public SerializeContext Context => _context ??= new SerializeContext();

    public void WriteByte(byte value) => _fileStream.WriteByte(value);

    public void WriteBytes(ReadOnlySpan<byte> src) => _fileStream.Write(src);

    public void Flush() => _fileStream.Flush();
    public Task FlushAsync() => _fileStream.FlushAsync();

    public void Dispose() => _fileStream.Dispose();
}