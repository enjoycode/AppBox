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
        TestHelper.TryInitDefaultStore();

        var mockSession = new MockSession(12345);
        HostRuntimeContext.SetCurrentSession(mockSession);
        var designHub = mockSession.GetDesignHub();
        await designHub.DesignTree.LoadAsync();

        var getPendingChanges = new GetPendingChanges();
        await getPendingChanges.Handle(designHub, new InvokeArgs());

        var publishHandler = new Publish();
        await publishHandler.Handle(designHub, InvokeArgs.Make("Commit Message"));
    }
}