using System;
using System.Threading.Tasks;
using AppBoxServer;
using NUnit.Framework;

namespace Tests.Design.Handlers;

public sealed class LoadDesignTreeTest
{
    [Test]
    public async Task LoadTest()
    {
        TestHelper.TryInitDefaultStore();

        var mockSession = new MockSession(12345);
        HostRuntimeContext.SetCurrentSession(mockSession);
        var designHub = mockSession.GetDesignHub();
        await designHub.DesignTree.LoadAsync();
        Console.WriteLine("Done.");
    }
}