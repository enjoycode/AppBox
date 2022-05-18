using System;
using System.IO;
using System.Threading.Tasks;
using AppBoxCore;
using AppBoxCore.Utils;
using AppBoxDesign;
using NUnit.Framework;

namespace Tests.Design.Handlers;

public class GetWebPreviewTest
{
    [Test]
    public async Task Test()
    {
        var mockSession = new MockSession(12345);
        var designHub = mockSession.GetDesignHub();
        await designHub.DesignTree.LoadAsync();
        
        var appId = StringUtil.GetHashCode("sys") ^ StringUtil.GetHashCode("sys");
        var viewModelId = ModelId.Make(appId, ModelType.View, 1, ModelLayer.SYS);
        var viewModelIdString = ((ulong)viewModelId.EncodedValue).ToString();
        
        var handler = new GetWebPreview();
        var res = (string)await handler.Handle(designHub, InvokeArgs.Make(viewModelIdString));
        Console.Write(res);
    }
}