namespace AppBoxCore;

public sealed class SystemWriteStream : IOutputStream
{
    public SystemWriteStream(Stream stream)
    {
        OutputStream = stream;
    }

    public readonly Stream OutputStream;
    private SerializeContext? _context;

    public SerializeContext Context => _context ??= new SerializeContext();

    public void WriteByte(byte value) => OutputStream.WriteByte(value);

    public void WriteBytes(ReadOnlySpan<byte> src) => OutputStream.Write(src);

    public void Flush() => OutputStream.Flush();
    public Task FlushAsync() => OutputStream.FlushAsync();
}