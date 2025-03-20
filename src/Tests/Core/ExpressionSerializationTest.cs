using System.Text.Json;
using AppBoxCore;
using AppBoxStore.Entities;
using NUnit.Framework;

namespace Tests.Core;

public class ExpressionSerializationTest
{
    [Test]
    public void Test1()
    {
        var exp1 = new MethodCallExpression(
            new MemberAccessExpression(new TypeExpression("System.DateTime"), "Today", false),
            "AddDays",
            [new ConstantExpression(1, new TypeExpression("double"))]
        );
        var data = SerializationTest.Serialize(exp1);
        var exp2 = SerializationTest.Deserialize(data);
        Assert.True(exp2!.ToString() == exp1.ToString());
    }

    [Test]
    public async Task EntityPathSerializeToJsonTest()
    {
        ServerRuntimeHelper.MockUserSession();

        var model = await RuntimeContext.GetModelAsync<EntityModel>(OrgUnit.MODELID);

        var root = new EntityExpression(model, null);
        var exp1 = root["Parent"]["Name"];

        using var ms = new MemoryStream();
        await using var writer = new Utf8JsonWriter(ms);
        ExpressionSerialization.SerializeToJson(writer, exp1, [root]);
        await writer.FlushAsync();

        ms.Position = 0;
        var reader = new Utf8JsonReader(ms.ToArray());
        var exp2 = (EntityPathExpression)ExpressionSerialization.DeserializeFromJson(ref reader, [root])!;
        Assert.True(exp2!.ToString() == exp1.ToString());
        Assert.AreSame(exp2.Owner!.Owner!, root);
    }
}