using AppBoxCore;
using NUnit.Framework;

namespace Tests.Core;

public sealed class DynamicObjectTest
{
    [Test]
    public void DynamicTest()
    {
        var obj = new DynamicEntity
        {
            ["Name"] = "Rick",
            ["Score"] = 100
        };

        string? name = obj["Name"];
        int? score = obj["Score"];

        Assert.True(name == "Rick");
        Assert.True(score == 100);
    }
}