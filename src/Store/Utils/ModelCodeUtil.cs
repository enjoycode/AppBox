using System;
using System.Buffers.Binary;
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
    internal static byte[] CompressCode(string code)
    {
        using var ms = new MemoryStream(1024);
        using var cs = new BrotliStream(ms, CompressionMode.Compress, true);
        StringUtil.WriteTo(code, cs.WriteByte);
        cs.Flush();

        return ms.ToArray();
    }

    internal static async Task CompressCode(Stream input, Stream output)
    {
        await using var cs = new BrotliStream(output, CompressionMode.Compress, true);
        await input.CopyToAsync(cs);
        await cs.FlushAsync();
    }

    internal static string DecompressCode(byte[] data)
    {
        using var ms = new MemoryStream(data);
        using var ds = new BrotliStream(ms, CompressionMode.Decompress, true);
        using var sr = new StreamReader(ds);
        return sr.ReadToEnd();
    }

    internal static async Task DecompressCode(Stream input, Stream output)
    {
        await using var ds = new BrotliStream(input, CompressionMode.Decompress, true);
        await ds.CopyToAsync(output);
    }

    /// <summary>
    /// 仅解压代码为utf8字节数组，不转换为字符串
    /// </summary>
    internal static byte[] DecompressCodeToUtf8Bytes(byte[] data)
    {
        using var ms = new MemoryStream(data);
        using var ds = new BrotliStream(ms, CompressionMode.Decompress, true);
        using var output = new MemoryStream(1024);
        ds.CopyTo(output);

        return output.ToArray();
    }
}