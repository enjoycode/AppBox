using NUnit.Framework;

namespace Tests.Design.Handlers;

public sealed class LoadDesignTreeTest : DesignContextTestBase
{
    [Test]
    public void TestGetModelId()
    {
        var modelNode = DesignContext.DesignTree.FindModelNodeByFullName("sys.Entities.OrgUnit")!;
        long modelId = modelNode.Model.Id;
        Console.WriteLine(modelId);
    }
}