using AppBoxClient;
using AppBoxCore;
using NUnit.Framework;

namespace Tests.Core;

public sealed class EntityTest
{
    [Test]
    public void GetMemberValueTest()
    {
        var entity = new DemoEntity { Name = "Rick" };
        var getter = new EntityMemberValueGetter();
        entity.WriteMember(1, ref getter, EntityMemberWriteFlags.None);
        Assert.True((string)getter.Value.BoxedValue! == entity.Name);
    }

    [Test]
    public void RxEntityTest()
    {
        var entity = new DemoEntity { Name = "Rick" };

        var rxName1 = entity.Observe(1, e => e.Name, (e, v) => e.Name = v);
        rxName1.AddListener(v => Console.WriteLine($"MockStateListener: [{v}] value changed."));

        var rxEntity = new RxEntity<DemoEntity> { Target = entity };
        var rxName2 = rxEntity.Observe(1, e => e.Name, (e, v) => e.Name = v);
        rxName2.AddListener(v => Console.WriteLine($"MockStateListener: [{v}] value changed."));

        entity.Name = "Eric";
        Assert.True(entity.Name == rxName1.Value && entity.Name == rxName2.Value);
    }
}