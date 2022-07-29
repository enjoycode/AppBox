using System;
using System.Threading.Tasks;
using AppBoxCore;
using AppBoxDesign;
using AppBoxServer;
using NUnit.Framework;

namespace Tests.Design;

public class CodeGenerateTest
{
    [Test]
    public async Task GenEntityWebCodeTest()
    {
        TestHelper.TryInitDefaultStore();

        var mockSession = new MockSession(12345);
        HostRuntimeContext.SetCurrentSession(mockSession);
        var designHub = mockSession.GetDesignHub();
        await designHub.DesignTree.LoadAsync();

        var entityNode = designHub.DesignTree.FindModelNodeByFullName("sys.Entities.Employee")!;

        var code = EntityCodeGenerator.GenEntityWebCode((EntityModel)entityNode.Model, "sys", true);
        Console.Write(code);
    }
    
    
    [Test]
    public async Task GenEntityCodeTest()
    {
        TestHelper.TryInitDefaultStore();

        var mockSession = new MockSession(12345);
        HostRuntimeContext.SetCurrentSession(mockSession);
        var designHub = mockSession.GetDesignHub();
        await designHub.DesignTree.LoadAsync();

        var entityNode = designHub.DesignTree.FindModelNodeByFullName("sys.Entities.Employee")!;

        var code = EntityCodeGenerator.GenEntityRuntimeCode(entityNode);
        Console.Write(code);
    }

    [Test]
    public async Task GenServiceRuntimeCodeTest()
    {
        TestHelper.TryInitDefaultStore();

        var mockSession = new MockSession(12345);
        HostRuntimeContext.SetCurrentSession(mockSession);
        var designHub = mockSession.GetDesignHub();
        await designHub.DesignTree.LoadAsync();

        var serviceModel = (ServiceModel)
            designHub.DesignTree.FindModelNodeByFullName("sys.Services.HelloService")!.Model;
        var res = await PublishService.CompileServiceAsync(designHub, serviceModel);
        Assert.True(res != null);
    }
}