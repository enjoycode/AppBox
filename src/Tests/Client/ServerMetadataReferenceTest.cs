using AppBoxClient;
using AppBoxCore;
using Microsoft.CodeAnalysis;
using NUnit.Framework;

namespace Tests.ClientUI;

public class ServerMetadataReferenceTest
{
    [Test]
    public async Task LoadTest()
    {
        Channel.Init(new WebSocketChannel(new Uri("ws://localhost:5000/ws")));
        await Channel.Login("Admin", "760wb");

        var tempFilePath = Path.GetTempFileName();
        var tempFileStream = new FileStream(tempFilePath, FileMode.Create, FileAccess.ReadWrite, FileShare.Read);
        await Channel.Download("sys.DesignService.LoadMetadataReference", tempFileStream,
            1, "AppBoxCore.dll", "");
        Console.WriteLine(tempFileStream.Length);

        tempFileStream.Position = 0;
        var metadata = MetadataReference.CreateFromStream(tempFileStream);
        Assert.NotNull(metadata);
        Console.WriteLine(metadata);

        await tempFileStream.DisposeAsync();
        File.Delete(tempFilePath);
    }
}