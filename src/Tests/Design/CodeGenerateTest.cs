using System;
using System.Threading.Tasks;
using AppBoxCore;
using AppBoxDesign;
using NUnit.Framework;

namespace Tests.Design;

public class CodeGenerateTest
{
    [Test]
    public async Task GenEntityWebCodeTest()
    {
        var designHub = await TestHelper.MockSession();
        var entityNode = designHub.DesignTree.FindModelNodeByFullName("sys.Entities.Employee")!;
        var code = EntityCodeGenerator.GenWebCode((EntityModel)entityNode.Model, "sys", true);
        Console.Write(code);
    }


    [Test]
    public async Task GenEntityCodeTest()
    {
        var designHub = await TestHelper.MockSession();
        var entityNode = designHub.DesignTree.FindModelNodeByFullName("sys.Entities.Employee")!;
        var code = EntityCodeGenerator.GenRuntimeCode(entityNode);
        Console.Write(code);
    }

    [Test(Description = "测试生成响应实体类")]
    public async Task GenRxEntityCodeTest()
    {
        var designHub = await TestHelper.MockSession();
        var entityNode = designHub.DesignTree.FindModelNodeByFullName("sys.Entities.OrgUnit")!;
        var code = EntityCodeGenerator.GenRxRuntimeCode((EntityModel)entityNode.Model,
            appId => designHub.DesignTree.FindApplicationNode(appId)!.Model.Name,
            id => designHub.DesignTree.FindModelNode(id)!.Model);
        Console.Write(code);
    }

    [Test]
    public async Task GenServiceRuntimeCodeTest()
    {
        var designHub = await TestHelper.MockSession();
        var serviceModel = (ServiceModel)
            designHub.DesignTree.FindModelNodeByFullName("sys.Services.OrgUnitService")!.Model;
        var res = await PublishService.CompileServiceAsync(designHub, serviceModel);
        Assert.True(res != null);
    }
}