using AppBoxCore;
using AppBoxStore.Entities;
using NUnit.Framework;
using Tests.Design;

namespace Tests.Core;

public class ExpressionEvaluatorTest : ExpressionTestBase
{
    [Test]
    public Task EvalAddWithConverted() => EvalExpression("return 1 + 2.5;", "double",
        // ReSharper disable once CompareOfFloatsByEqualityOperator
        res => res.GetDouble()!.Value == 1 + 2.5);

    [Test]
    public Task EvalMethoCall1() => EvalExpression("return object.Equals(null, 1);", "bool",
        res => !res.GetBool()!.Value);

    [Test]
    public Task EvalMethodCall2() => EvalExpression("return Equals(null, 1);", "bool",
        res => !res.GetBool()!.Value);

    [Test]
    public Task EvalStaticProperty() => EvalExpression("return System.DateTime.Now;", "DateTime",
        res => res.GetDateTime()!.Value <= DateTime.Now);

    [Test]
    public Task EvalAwaitVoid() => EvalExpression("await Task.Delay(500);", "async Task");

    [Test]
    public Task EvalAwaitResult() => EvalExpression("return await Task.FromResult(123);", "async Task<int>",
        res => res.GetInt()!.Value == 123);

    [Test]
    public Task EvalDynamicEntityMemberAccess() => EvalAppBoxExpression("return e.Name;", "string",
        "sys.Entities.Employee e",
        new Dictionary<string, AnyValue>
        {
            { "e", AnyValue.From(new Employee(Guid.NewGuid()) { Name = "Rick" }.ToEntityData()) },
        },
        res => res.BoxedValue != null && res.BoxedValue.ToString() == "Rick");

    //----------------------------------------------------------------------

    [Test]
    public void ParseIndexerTest1()
    {
        var exp = ParseExpression("return map[\"key\"];", "int", "Dictionary<string,int> map");
        Assert.IsTrue(exp is IndexExpression);
    }

    [Test]
    public void ParseIndexerTest2()
    {
        var exp = ParseExpression("return list[0];", "int", "List<int> list");
        Assert.IsTrue(exp is IndexExpression);
    }

    [Test]
    public void ParseArrayAccessTest()
    {
        var exp = ParseExpression("return array[0];", "int", "int[] array");
        Assert.IsTrue(exp is IndexExpression);
    }
}