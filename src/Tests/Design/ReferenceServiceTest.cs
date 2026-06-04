using System.Threading.Tasks;
using AppBoxCore;
using NUnit.Framework;
using AppBoxDesign;

namespace Tests.Design;

public class ReferenceServiceTest
{
    [Test]
    public async Task FindModelReferencesTest()
    {
        var hub = await DesignHelper.MockDesignContext();
        var modelNode = hub.DesignTree.FindModelNodeByFullName("sys.Enums.Gender")!;
        var res = await ReferenceService.FindModelReferencesAsync(hub, modelNode);
        Assert.True(res.Count > 0);
    }

    [Test]
    public async Task FindEntityMemberReferencesTest()
    {
        var hub = await DesignHelper.MockDesignContext();
        var customerNode = hub.DesignTree.FindModelNodeByFullName("sys.Entities.Customer");
        var entityModel = (EntityModel)customerNode!.Model;
        var entityMember = entityModel.GetMember("City")!;

        var res = await ReferenceService.FindEntityMemberReferencesAsync(hub, customerNode,
            entityMember);
        Assert.True(res.Count > 0);
    }

    [Test]
    public async Task FineEnumItemReferencesTest()
    {
        var hub = await DesignHelper.MockDesignContext();
        var enumModelNode = hub.DesignTree.FindModelNodeByFullName("sys.Enums.Gender")!;
        var res = await ReferenceService.FindEnumItemReferencesAsync(hub, enumModelNode, "Male");
        Assert.True(res.Count > 0);
    }
}