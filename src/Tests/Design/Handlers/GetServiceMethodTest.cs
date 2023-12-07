using System;
using System.Threading.Tasks;
using AppBoxCore;
using AppBoxDesign;
using NUnit.Framework;

namespace Tests.Design.Handlers;

public class GetServiceMethodTest
{
    [Test]
    public async Task Test()
    {
        var designHub = await TestHelper.MockSession();
        
        var handler = new GetServiceMethod();
        var res = await handler.Handle(designHub, InvokeArgs.Make(false, "sys.OrderService.GetOrders2"));
        
    }
}