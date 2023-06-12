using System;
using System.Threading.Tasks;
using AppBoxCore;
using AppBoxDesign;
using NUnit.Framework;

namespace Tests.Design.Handlers;

public sealed class BuildAppTest
{
    [Test]
    public async Task BuildTest()
    {
        var designHub = await TestHelper.MockSession();

        var handler = new BuildApp(); 
        await handler.Handle(designHub, InvokeArgs.Make(true));
    }
}