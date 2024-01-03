using AppBoxCore;
using NUnit.Framework;

namespace Tests.Core;

public class ExpressionSerializationTest
{
    [Test]
    public void Test1()
    {
        var exp1 = new MethodCallExpression(
            new MemberAccessExpression(new TypeExpression("System.DateTime"), "Today", false),
            "AddDays", new Expression[]
            {
                new ConstantExpression(1, new TypeExpression("double"))
            }
        );
        var data = SerializationTest.Serialize(exp1);
        var exp2 = SerializationTest.Deserialize(data);
        Assert.True(exp2!.ToString() == exp1.ToString());
    }
}