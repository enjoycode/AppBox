using System;
using System.IO;
using System.IO.Compression;
using System.Xml;
using AppBoxCore;

namespace AppBoxStore;

/// <summary>
/// 用于压缩编解码模型的代码
/// </summary>
internal static class ModelCodeUtil
{
    internal static unsafe byte[] CompressCode(string code)
    {
        using var ms = new MemoryStream(1024);
        //先写入字符数
        var chars = code.Length;
        var span = new Span<byte>(&chars, 4);
        ms.Write(span);

        //再压缩写入代码
        using var cs = new BrotliStream(ms, CompressionMode.Compress, true);
        // ReSharper disable once AccessToDisposedClosure
        StringUtil.WriteTo(code, b => cs.WriteByte(b));
        cs.Flush();

        return ms.ToArray();
    }

    internal static unsafe string DecompressCode(byte[] data)
    {
        using var ms = new MemoryStream(data);
        //先读取字符数
        var chars = 0;
        var span = new Span<byte>(&chars, 4);
        var bytesRead = ms.Read(span);
        if (bytesRead != 4) throw new Exception();

        //再解压代码
        using var ds = new BrotliStream(ms, CompressionMode.Decompress, true);
        var res = StringUtil.ReadFrom(chars, () =>
        {
            // ReSharper disable once AccessToDisposedClosure
            var b = ds.ReadByte();
            if (b < 0) throw new Exception();
            return (byte)b;
        });
        return res;
    }

    /// <summary>
    /// 仅解压代码为utf8字节数组，不转换为字符串
    /// </summary>
    internal static unsafe byte[] DecompressCodeToUtf8Bytes(byte[] data)
    {
        using var ms = new MemoryStream(data);
        //先读取字符数
        var chars = 0;
        var span = new Span<byte>(&chars, 4);
        var bytesRead = ms.Read(span);
        if (bytesRead != 4) throw new Exception("Read total chars error");

        //再解压代码
        using var ds = new BrotliStream(ms, CompressionMode.Decompress, true);
        using var output = new MemoryStream(1024);
        ds.CopyTo(output);

        return output.ToArray();
    }
}