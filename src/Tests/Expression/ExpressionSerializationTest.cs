using AppBoxCore;
using AppBoxStore.Entities;
using NUnit.Framework;

namespace Tests.Core;

public class ExpressionSerializationTest
{
    [Test]
    public void MethodCallTest()
    {
        var exp1 = Expression.InstanceCall(
            Expression.StaticProperty(ExpressionTypeInfo.DateTime, "Today", ExpressionTypeInfo.DateTime),
            "AddDays", ExpressionTypeInfo.DateTime,
            [Expression.Constant(1, ExpressionTypeInfo.Double.WithConverted())]
        );
        var data = SerializationTest.Serialize(exp1);
        var exp2 = SerializationTest.Deserialize(data);
        Assert.True(exp2!.ToString() == exp1.ToString());
    }

    [Test]
    public async Task EntityPathTest()
    {
        ServerRuntimeHelper.MockUserSession();

        var model = await RuntimeContext.GetModelAsync<EntityModel>(OrgUnit.MODELID);

        var root = new EntityExpression(model, null);
        var exp1 = root.R("Parent", OrgUnit.MODELID).F("Name");

        using var ms = new MemoryStream();
        var writer = new SystemWriteStream(ms);
        writer.SerializeExpression(exp1);

        ms.Position = 0;
        var reader = new SystemReadStream(ms);
        var exp2 = (EntityFieldExpression)reader.Deserialize()!;
        Assert.True(exp2.ToString() == exp1.ToString());
    }
}