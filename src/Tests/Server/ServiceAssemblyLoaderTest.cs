using AppBoxServer;
using NUnit.Framework;

namespace Tests.Server;

public class ServiceAssemblyLoaderTest
{
    [Test]
    public void LoadServiceFromCompressedDataTest()
    {
        var data = Resources.GetBytes("Server.HelloService.bin");
        var loader = new ServiceAssemblyLoader("libPath");
        Assert.True(loader.IsCollectible);
        var asm = loader.LoadServiceAssembly(data);
        var serviceInstance = asm.CreateInstance("HelloService");
        Assert.True(serviceInstance != null);
    }
}