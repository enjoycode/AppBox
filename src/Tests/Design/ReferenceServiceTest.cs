using System;
using System.Threading.Tasks;
using AppBoxCore;
using NUnit.Framework;
using AppBoxDesign;

namespace Tests.Design;

public class ReferenceServiceTest
{
    [Test]
    public async Task FindModelReferencesTest()
    {
        var hub = await TestHelper.MockSession();

        var res = await ReferenceService.FindModelReferencesAsync(hub, ModelType.Entity, "sys",
            "Customer");
        Console.WriteLine("Done");
    }
}