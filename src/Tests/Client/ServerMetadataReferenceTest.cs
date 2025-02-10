using AppBoxClient;
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
        var stream = await Channel.InvokeForStream("sys.DesignService.LoadMetadataReference",
            [1, "AppBoxCore.dll"]);
        Assert.NotNull(stream);
        Console.WriteLine(stream.Length);

        var metadata = MetadataReference.CreateFromStream(stream);
        Assert.NotNull(metadata);
        Console.WriteLine(metadata);
    }
}