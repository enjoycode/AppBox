using System;
using AppBoxCore;
using NUnit.Framework;

namespace Tests.Core;

public sealed class EntityTest
{
    [Test]
    public void GetMemberValueTest()
    {
        var entity = new TestEntity() { Name = "Rick" };
        var getter = EntityMemberValueGetter.ThreadInstance;
        entity.WriteMember(1, getter, EntityMemberWriteFlags.None);
        Assert.True((string)getter.Value.BoxedValue! == "Rick");
    }
}