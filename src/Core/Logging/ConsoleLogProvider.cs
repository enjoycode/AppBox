using System.Buffers;
using System.Runtime.InteropServices;

namespace AppBoxCore;

public sealed class ConsoleLogProvider : ILogProvider
{
    //1B5B33316D [=5B 3=33 1=31 m=6D
    private static readonly byte[] Red = { 0x1B, 0x5B, 0x33, 0x31, 0x6D };
    private static readonly byte[] Green = { 0x1B, 0x5B, 0x33, 0x32, 0x6D };
    private static readonly byte[] Yellow = { 0x1B, 0x5B, 0x33, 0x33, 0x6D };
    private static readonly byte[] Blue = { 0x1B, 0x5B, 0x33, 0x34, 0x6D };
    private static readonly byte[] Magenta = { 0x1B, 0x5B, 0x33, 0x35, 0x6D };
    private static readonly byte[] Reset = { 0x1B, 0x5b, 0x30, 0x6D };

    public ConsoleLogProvider()
    {
        _isWindows = RuntimeInformation.IsOSPlatform(OSPlatform.Windows);
    }

    private readonly bool _isWindows;

    private static char GetLevelChar(LogLevel level)
    {
        return level switch
        {
            LogLevel.Debug => 'D',
            LogLevel.Info => 'I',
            LogLevel.Warn => 'W',
            LogLevel.Error => 'E',
            _ => 'U',
        };
    }

    private static byte[] GetLevelColor(LogLevel level)
    {
        return level switch
        {
            LogLevel.Debug => Blue,
            LogLevel.Info => Green,
            LogLevel.Warn => Yellow,
            LogLevel.Error => Red,
            _ => Magenta,
        };
    }

    public void Write(LogLevel level, string file, int line, string method, string msg)
    {
        //TODO:暂先简单实现，待优化
        var now = DateTime.Now;
        var head = string.Format("[{0}{1:MM}{1:dd} {1:hh:mm:ss} {2}.{3}:{4}]: ",
            GetLevelChar(level), now, file, method, line);

        var headerSize = 0;
        StringUtil.WriteTo(head, b => headerSize++);
        var logSize = 0;
        StringUtil.WriteTo(msg, b => logSize++);

        var totalSize = 5 + headerSize + 4 + logSize + (_isWindows ? 2 : 1);
        var buf = ArrayPool<byte>.Shared.Rent(totalSize);
        var color = GetLevelColor(level);
        color.AsSpan().CopyTo(buf.AsSpan(0, 5));
        var headerIndex = 5;
        StringUtil.WriteTo(head, b => buf[headerIndex++] = b);
        Reset.AsSpan().CopyTo(buf.AsSpan(5 + headerSize, 4));
        var logIndex = 5 + headerSize + 4;
        StringUtil.WriteTo(msg, b => buf[logIndex++] = b);
        if (_isWindows)
            buf[totalSize - 2] = 0x0D; //cr
        buf[totalSize - 1] = 0x0A; //lf

        using (var output = Console.OpenStandardOutput())
        {
            output.Write(buf, 0, totalSize);
        }

        ArrayPool<byte>.Shared.Return(buf);
    }
}