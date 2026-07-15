using AppBoxCore;
using NUnit.Framework;
using AppBoxDesign;

namespace Tests.Design;

public class ReferenceServiceTest : DesignContextTestBase
{
    [Test]
    public async Task FindModelReferencesTest()
    {
        var modelNode = DesignContext.DesignTree.FindModelNodeByFullName("sys.Enums.Gender")!;
        var res = await ReferenceService.FindModelReferencesAsync(DesignContext, modelNode);
        Assert.True(res.Count > 0);
    }

    [Test]
    public async Task FindEntityMemberReferencesTest()
    {
        var customerNode = DesignContext.DesignTree.FindModelNodeByFullName("sys.Entities.Customer");
        var entityModel = (EntityModel)customerNode!.Model;
        var entityMember = entityModel.GetMember("City")!;

        var res = await ReferenceService.FindEntityMemberReferencesAsync(DesignContext, customerNode,
            entityMember);
        Assert.True(res.Count > 0);
    }

    [Test]
    public async Task FineEnumItemReferencesTest()
    {
        var enumModelNode = DesignContext.DesignTree.FindModelNodeByFullName("sys.Enums.Gender")!;
        var res = await ReferenceService.FindEnumItemReferencesAsync(DesignContext, enumModelNode, "Male");
        Assert.True(res.Count > 0);
    }
}