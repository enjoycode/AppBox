using System;
using AppBoxClient;
using AppBoxCore;
using NUnit.Framework;
using PixUI;

namespace Tests.Core;

public sealed class EntityTest
{
    [Test]
    public void GetMemberValueTest()
    {
        var entity = new TestEntity { Name = "Rick" };
        var getter = new EntityMemberValueGetter();
        entity.WriteMember(1, ref getter, EntityMemberWriteFlags.None);
        Assert.True((string)getter.Value.BoxedValue! == entity.Name);
    }

    [Test]
    public void RxEntityTest()
    {
        var entity = new TestEntity { Name = "Rick" };

        var rxName1 = entity.Observe(1, e => e.Name, (e, v) => e.Name = v);
        var listener1 = new MockStateListener("Listener1");
        rxName1.AddBinding(listener1, BindingOptions.None);
        
        var rxEntity = new RxEntity<TestEntity> { Target = entity };
        var rxName2 = rxEntity.Observe(1, e => e.Name, (e, v) => e.Name = v);
        var listener2 = new MockStateListener("Listener2");
        rxName2.AddBinding(listener2, BindingOptions.None);

        entity.Name = "Eric";
        Assert.True(entity.Name == rxName1.Value && entity.Name == rxName2.Value);
    }
}

public sealed class MockStateListener : IStateBindable
{
    public MockStateListener(string name)
    {
        _name = name;
    }

    private readonly string _name;
    
    public void OnStateChanged(State state, BindingOptions options)
    {
        Console.WriteLine($"MockStateListener: [{_name}] value changed.");
    }
}