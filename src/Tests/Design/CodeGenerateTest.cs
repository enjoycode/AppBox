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
    public void GenEntityCodeTest()
    {
        const int appId = 12345;
        var empModel = new EntityModel(
            ModelId.Make(appId, ModelType.Entity, 1, ModelLayer.SYS), "Employee");
        empModel.AddMember(new DataFieldModel(empModel, "Name", DataFieldType.String, false));

        var code = CodeGenService.GenEntityDummyCode(empModel, "sys", null);
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