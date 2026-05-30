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
        var tempFilePath = Path.GetTempFileName();
        var tempFileStream = new FileStream(tempFilePath, FileMode.Create, FileAccess.ReadWrite, FileShare.Read);
        await Channel.Download(DesignMethods.LoadMetadataReferenceFull, tempFileStream,
            1, "AppBoxCore.dll", "");
        Console.WriteLine(tempFileStream.Length);

        tempFileStream.Position = 0;
        var metadata = MetadataReference.CreateFromStream(tempFileStream);
        Assert.NotNull(metadata);
        Console.WriteLine(metadata);

        await tempFileStream.DisposeAsync();
        File.Delete(tempFilePath);
    }

    [Test]
    public async Task UploadTest()
    {
        var filePath = "/Users/rick/Desktop/测试模型/HelloService.dll";
        var fileStream = File.OpenRead(filePath);
        var pipeWriter = new BytesPipeWriter(Channel.Provider, w => w.CopyFromAsync(fileStream));
        var assemblyFlag = await Channel.Upload<byte>(DesignMethods.UploadExtAssemblyFull,
            pipeWriter, "sys", "HelloService.dll");
        await fileStream.DisposeAsync();
        Console.WriteLine($"Upload done. Res= {assemblyFlag}");
    }
}