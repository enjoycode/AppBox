using System;
using System.Threading.Tasks;
using AppBoxCore;
using AppBoxDesign;
using NUnit.Framework;

namespace Tests.Design.Handlers;

public class GetWebPreviewTest
{
    [Test]
    public async Task Test()
    {
        var designHub = await TestHelper.MockSession();
        var modelNode = designHub.DesignTree.FindModelNodeByFullName("sys.Views.HomePage")!;

        var handler = new GetWebPreview();
        var res = (string)await handler.Handle(designHub, InvokeArgs.Make(modelNode.Id));
        Console.Write(res);
    }
}