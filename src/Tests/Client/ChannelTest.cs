using AppBoxClient;
using AppBoxDesign;
using Microsoft.CodeAnalysis;
using NUnit.Framework;

namespace Tests.ClientUI;

public class ChannelTest
{
    private Task InitChannel()
    {
        Channel.Init(new WebSocketChannel(new Uri("ws://localhost:5000/ws")));
        return Channel.Login("Admin", "760wb");
    }

    [Test]
    public async Task DownloadTest()
    {
        await InitChannel();

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
        await InitChannel();

        var filePath = "/Users/rick/Desktop/测试模型/HelloService.dll";
        var fileStream = File.OpenRead(filePath);
        var assemblyFlag = await Channel.Upload<byte>(DesignMethods.UploadExtAssemblyFull,
            fileStream, "sys", "HelloService.dll");
        Console.WriteLine(assemblyFlag);
    }
}