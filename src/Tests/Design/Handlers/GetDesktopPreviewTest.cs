using System;
using System.Threading.Tasks;
using AppBoxCore;
using AppBoxDesign;
using AppBoxServer;
using NUnit.Framework;

namespace Tests.Design.Handlers;

public class GetDesktopPreviewTest
{
    [Test]
    public async Task Test()
    {
        throw new NotImplementedException();
        // var designHub = await TestHelper.MockSession();
        // var modelNode = designHub.DesignTree.FindModelNodeByFullName("sys.Views.HomePage")!;
        //
        // var handler = new GetDesktopPreview();
        // var res = (byte[])await handler.Handle(designHub, AnyArgs.Make(modelNode.Id));
        // Console.Write($"{res} {res.Length}");
    }
}