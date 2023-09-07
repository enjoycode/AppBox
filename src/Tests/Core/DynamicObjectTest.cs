using AppBoxCore;
using NUnit.Framework;

namespace Tests.Core;

public sealed class DynamicObjectTest
{
    [Test]
    public void DynamicTest()
    {
        int? v = null;
        DynamicEntity obj = new()
        {
            ["Name"] = "Rick",
            ["Score"] = v ?? DynamicField.Empty,
        };

        string? name = obj["Name"];
        int? score = obj["Score"];

        Assert.True(name == "Rick");
        Assert.True(score == 100);
    }
}