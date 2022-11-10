using AppBoxCore;
using NUnit.Framework;

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
}