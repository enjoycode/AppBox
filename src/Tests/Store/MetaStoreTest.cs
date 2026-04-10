using System.IO.Compression;
using AppBoxStore;
using NUnit.Framework;

namespace Tests.Store;

public class MetaStoreTest
{
    static MetaStoreTest()
    {
        ServerRuntimeHelper.MockUserSession();
    }

    [Test(Description = "测试解压缩视图Assembly")]
    public async Task DecompressViewAssemblyTest()
    {
        var asmName = "1";
        var data = await MetaStore.Provider.LoadAppAssemblyAsync(asmName);
        if (data == null)
            throw new Exception($"Can't load assembly: {asmName}");

        using var input = new MemoryStream(data);
        using var output = new MemoryStream();
        await using var cs = new DeflateStream(input, CompressionMode.Decompress, true);
        await cs.CopyToAsync(output);
        cs.Flush();

        Assert.True(output.Length > 0);
    }
}