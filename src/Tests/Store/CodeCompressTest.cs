using NUnit.Framework;
using AppBoxStore;

namespace Tests.Store;

public sealed class CodeCompressTest
{
    [Test]
    public void CompressTest()
    {
        const string src = "h中😀Hello World, Hello Future!";
        var data = ModelCodeUtil.CompressCode(src);
        var dest = ModelCodeUtil.DecompressCode(data);
        Assert.True(src == dest);
    }
}