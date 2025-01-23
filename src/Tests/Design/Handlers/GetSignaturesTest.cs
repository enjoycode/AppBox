using System;
using System.Collections;
using System.Linq;
using System.Threading.Tasks;
using AppBoxCore;
using AppBoxDesign;
using NUnit.Framework;

namespace Tests.Design.Handlers;

public class GetSignaturesTest
{
    [Test]
    public async Task Test()
    {
        throw new NotImplementedException();
        // var designHub = await TestHelper.MockSession();
        //
        // var appId = StringUtil.GetHashCode("sys") ^ StringUtil.GetHashCode("sys");
        // var viewModelId = ModelId.Make(appId, ModelType.View, 1, ModelLayer.SYS);
        // var viewModelIdString = viewModelId.ToString();
        //
        // var handler = new GetSignatures();
        // var res = await handler.Handle(designHub, InvokeArgs.Make(viewModelIdString, 105));
        // var response = (SignatureResult)res.BoxedValue!;
        // Console.WriteLine(response!.Signatures.Count());
    }
}