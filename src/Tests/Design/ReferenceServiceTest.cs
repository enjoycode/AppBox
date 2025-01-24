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
        var hub = await DesignHelper.MockDesignHub();
        var customerNode = hub.DesignTree.FindModelNodeByFullName("sys.Entities.Customer");
        var res = await ReferenceService.FindModelReferencesAsync(hub, customerNode);
        Assert.True(res != null && res.Count > 0);
    }

    [Test]
    public async Task FindEntityMemberReferencesTest()
    {
        var hub = await DesignHelper.MockDesignHub();
        var customerNode = hub.DesignTree.FindModelNodeByFullName("sys.Entities.Customer");
        var entityModel = (EntityModel)customerNode!.Model;
        var entityMember = entityModel.GetMember("City")!;

        var res = await ReferenceService.FindEntityMemberReferencesAsync(hub, customerNode,
            entityMember);
        Assert.True(res != null && res.Count > 0);
    }
}