using System;
using System.Threading.Tasks;
using AppBoxCore;
using AppBoxDesign;
using AppBoxServer;
using NUnit.Framework;

namespace Tests.Design.Handlers;

public class PublishTest
{
    [Test]
    public async Task Test()
    {
        throw new NotImplementedException();
        // var designHub = await TestHelper.MockSession();
        //
        // var getPendingChanges = new GetPendingChanges();
        // await getPendingChanges.Handle(designHub, new InvokeArgs());
        //
        // var publishHandler = new Publish();
        // await publishHandler.Handle(designHub, InvokeArgs.Make("Commit Message"));
    }
}