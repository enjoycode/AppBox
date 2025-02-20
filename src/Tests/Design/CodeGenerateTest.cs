using System;
using System.Threading.Tasks;
using AppBoxCore;
using AppBoxDesign;
using NUnit.Framework;

namespace Tests.Design;

public class CodeGenerateTest
{
    [Test(Description = "测试生成实体模型的Web代码")]
    public async Task GenEntityWebCodeTest()
    {
        var designHub = await DesignHelper.MockDesignHub();
        var entityNode = designHub.DesignTree.FindModelNodeByFullName("sys.Entities.Warehouse")!;
        var code = EntityJsGenerator.GenWebCode((EntityModel)entityNode.Model, designHub, true);
        Console.Write(code);
    }

    // [Test(Description = "测试生成视图模型的Web预览代码")]
    // public async Task GetViewWebCodeTest()
    // {
    //     var designHub = await TestHelper.MockSession();
    //     var modelNode = designHub.DesignTree.FindModelNodeByFullName("sys.Views.HomePage")!;
    //
    //     var res = await ViewJsGenerator.GenViewWebCode(designHub, modelNode.Id, true);
    //     Console.Write(res);
    // }

    [Test]
    public async Task GenEntityCodeTest()
    {
        var designHub = await DesignHelper.MockDesignHub();
        var entityNode = designHub.DesignTree.FindModelNodeByFullName("sys.Entities.DemandVO")!;
        var code = EntityCsGenerator.GenRuntimeCode(entityNode);
        Console.Write(code);
    }

    [Test(Description = "测试生成响应实体类虚拟代码")]
    public async Task GenRxEntityCodeTest()
    {
        var designHub = await DesignHelper.MockDesignHub();
        var entityNode = designHub.DesignTree.FindModelNodeByFullName("sys.Entities.Employee")!;
        var code = EntityCsGenerator.GenRxEntityCode(entityNode);
        Console.Write(code);
    }

    [Test(Description = "测试生成权限模型虚拟代码")]
    public async Task GenPermissionCodeTest()
    {
        var designHub = await DesignHelper.MockDesignHub();
        var node = designHub.DesignTree.FindModelNodeByFullName("sys.Permissions.Admin")!;
        var model = (PermissionModel)node.Model;
        var code = PermissionCodeGenerator.GenServerCode(model, node.AppNode.Model.Name);
        Console.WriteLine(code);
    }

    [Test]
    public async Task GenViewRuntimeCodeTest()
    {
        var designHub = await DesignHelper.MockDesignHub();
        var node = designHub.DesignTree.FindModelNodeByFullName("sys.Views.Demo1")!;
        var generator = await ViewCsGenerator.Make(designHub, node, false);
        var syntaxTree = await generator.GetRuntimeSyntaxTree();
        Console.WriteLine(syntaxTree.ToString());
    }

    [Test(Description = "测试生成服务的运行时代码")]
    public async Task GenServiceRuntimeCodeTest()
    {
        var designHub = await DesignHelper.MockDesignHub();
        var serviceModel =
            (ServiceModel)designHub.DesignTree.FindModelNodeByFullName("sys.Services.DemandService")!.Model;
        var res = await Publish.CompileServiceAsync(designHub, serviceModel, false);
        Assert.True(res != null);
    }
}