using AppBoxClient;
using AppBoxCore.Channel;
using AppBoxDesign;
using Microsoft.CodeAnalysis;
using NUnit.Framework;

namespace Tests.ClientUI;

public class ChannelTest
{
    [SetUp]
    public async Task Setup()
    {
        Channel.Init(new WebSocketChannel(new Uri("ws://localhost:5000/ws")));
        await Channel.Login("Admin", "760wb");
    }

    [Test]
    public async Task DownloadTest()
    {
        var reader = Channel.Download(DesignMethods.LoadMetadataReferenceFull, 1, "AppBoxCore.dll", "");

        using var ms = new MemoryStream();
        await reader.CopyToStreamAsync(ms);
        ms.Seek(0, SeekOrigin.Begin);
        var metadata = MetadataReference.CreateFromStream(ms);
        Assert.NotNull(metadata);
        Console.WriteLine(metadata);
    }

    [Test]
    public async Task UploadTest()
    {
        var filePath = "/Users/rick/Desktop/测试模型/HelloService.dll";
        var fileStream = File.OpenRead(filePath);
        var pipeWriter = new PipeBytesWriter(w => w.CopyFromAsync(fileStream));
        var assemblyFlag = await Channel.Upload<byte>(DesignMethods.UploadExtAssemblyFull,
            pipeWriter, "sys", "HelloService.dll");
        await fileStream.DisposeAsync();
        Console.WriteLine($"Upload done. Res= {assemblyFlag}");
    }
}