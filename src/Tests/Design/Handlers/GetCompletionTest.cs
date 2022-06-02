using System;
using System.Collections;
using System.Threading.Tasks;
using AppBoxCore;
using AppBoxDesign;
using NUnit.Framework;

namespace Tests.Design.Handlers;

public class GetCompletionTest
{
    [Test]
    public async Task Test()
    {
        var mockSession = new MockSession(12345);
        var designHub = mockSession.GetDesignHub();
        await designHub.DesignTree.LoadAsync();

        var appId = StringUtil.GetHashCode("sys") ^ StringUtil.GetHashCode("sys");
        var viewModelId = ModelId.Make(appId, ModelType.View, 1, ModelLayer.SYS);
        var viewModelIdString = viewModelId.ToString();

        var handler = new GetCompletion();
        var res = await handler.Handle(designHub,
            InvokeArgs.Make(0, viewModelIdString, 7, "S"));
        var list = (IList)res.BoxedValue!;
        foreach (var item in list)
        {
            Console.WriteLine(item);
        }
    }
}