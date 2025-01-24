using System;
using System.Threading.Tasks;
using AppBoxServer;
using NUnit.Framework;

namespace Tests.Design.Handlers;

public sealed class LoadDesignTreeTest
{
    [Test]
    public async Task TestGetModelId()
    {
        var designHub = await DesignHelper.MockDesignHub();

        var modelNode = designHub.DesignTree.FindModelNodeByFullName("sys.Entities.OrgUnit")!;
        long modelId = modelNode.Model.Id;
        Console.WriteLine(modelId);
    }
}