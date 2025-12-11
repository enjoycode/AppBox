using NUnit.Framework;

namespace Tests.Core;

public class EntityDataTest
{
    /// <summary>
    /// 测试互相转换
    /// </summary>
    [Test]
    public void ConvertTest()
    {
        var entity1 = new DemoEntity() { Name = "Test1", Score = 100 };
        var data = entity1.ToEntityData();
        var entity2 = data.ToEntity<DemoEntity>();

        Assert.AreEqual(entity1, entity2);
    }
}