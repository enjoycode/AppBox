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
        var entityNode = designHub.DesignTree.FindModelNodeByFullName("demo.Entities.Customer")!;
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
        const string viewCode = """
                                public class HomePage: View
                                {
                                    private async void OnClick()
                                    {
                                        var gender = sys.Enums.Gender.Male;
                                        //System.IO.Stream uploadStream = null!;
                                        //await sys.Services.OrderService.Hello1(uploadStream, "aa");
                                        //System.IO.Stream downloadStream = null!;
                                        //await sys.Services.OrderService.DownloadTest(downloadStream, "aa");
                                    }
                                }
                                """;

        var modelNode = designHub.DesignTree.FindModelNodeByFullName("sys.Views.HomePage")!;
        await DesignHelper.ReplaceCode(designHub, modelNode.RoslynDocumentId!, viewCode);

        var generator = await ViewCsGenerator.Make(designHub, modelNode, false);
        var syntaxTree = await generator.GetRuntimeSyntaxTree();
        Console.WriteLine(syntaxTree.ToString());
    }

    [Test(Description = "测试生成服务的运行时代码")]
    public async Task GenServiceRuntimeCodeTest()
    {
        var designHub = await DesignHelper.MockDesignHub();
        const string serviceCode = """
                                   public sealed class OrderService
                                   {
                                       public async Task<object?> IncludeTest(Guid id, sys.Enums.Gender? gender)
                                       {
                                           var q = new SqlQuery<sys.Entities.OrgUnit>();
                                           //q.Include(t => t.Parent);
                                           //q.Where(t => t.Name == "IT Dept" && t.Parent.Name.Contains("AA"));
                                           //q.AsSubQuery(t => t.Id);
                                           var sq = q.AsSubQuery(t => new {t.Id, t.Name});
                                           return await sq.ToDataTableAsync(t => new{t.Id, t.Name});
                                       }
                                   }
                                   """;

        var serviceNode = designHub.DesignTree.FindModelNodeByFullName("sys.Services.OrderService")!;
        var serviceModel = (ServiceModel)serviceNode.Model;
        await DesignHelper.ReplaceCode(designHub, serviceNode.RoslynDocumentId!, serviceCode);

        using var ms = new MemoryStream(2048);
        await PublishCommand.CompileServiceAsync(ms, designHub, serviceModel, false);
        Assert.True(ms.Length > 0);
    }

    [Test]
    public async Task GenServiceProxyCodeTest()
    {
        var designHub = await DesignHelper.MockDesignHub();
        var serviceNode = designHub.DesignTree.FindModelNodeByFullName("sys.Services.OrderService")!;
        var serviceModel = (ServiceModel)serviceNode.Model;
        var doc = designHub.TypeSystem.Workspace.CurrentSolution.GetDocument(serviceNode.RoslynDocumentId)!;
        var proxyCode = await ServiceProxyGenerator.GenServiceProxyCode(doc!, "sys", serviceModel);
        Console.WriteLine(proxyCode);
    }
}