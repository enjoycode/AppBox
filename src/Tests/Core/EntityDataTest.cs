using AppBoxCore;
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

    // [Test]
    // public void ConvertTest2()
    // {
    //     var /*object*/ entity1 = new DemoEntity() { Name = "Test1", Score = 100 };
    //     EntityData data = (EntityData)entity1;
    //     object entity2 = (DemoEntityClone)data;
    //
    //     Assert.AreEqual(entity1, entity2);
    // }

    /// <summary>
    /// 实体序列化后在未指定EntityFactory的情况下反序列化为EntityData
    /// </summary>
    [Test]
    public void SerializeTest()
    {
        var entity1 = new DemoEntity() { Name = "Test1", Score = 100 };
        var data = SerializationTest.Serialize(entity1);

        var entityData = (EntityData)SerializationTest.Deserialize(data)!;
        var entity2 = entityData.ToEntity<DemoEntity>();
        Assert.AreEqual(entity1, entity2);
    }
}