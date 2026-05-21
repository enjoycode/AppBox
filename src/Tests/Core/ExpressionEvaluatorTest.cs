using System.Diagnostics;
using AppBoxCore;
using AppBoxDesign;
using AppBoxDesign.CodeGenerator;
using NUnit.Framework;
using LinqExpression = System.Linq.Expressions.Expression;

namespace Tests.Core;

public class ExpressionEvaluatorTest
{
    [SetUp]
    public static async Task InitSetup()
    {
        await MetadataReferences.InitAsync(new MockMetadataReferenceProvider());
    }

    private static async Task<AnyValue> EvalSingleLine(string lineCode, string returnType = "void")
    {
        var code =
            $"using System;using System.Threading.Tasks;static class C{{static {returnType} M(){{{lineCode};}}}}";
        var exp = ExpressionParser.ParseCode(code, lineCode.StartsWith("return "));
        var evaluator = new ExpressionEvaluator();
        var context = new ExpressionEvalContext(ExpressionContext.Default);
        var ts = Stopwatch.GetTimestamp();
        var result = await evaluator.Visit(exp, context);
        Console.WriteLine($"used: {Stopwatch.GetElapsedTime(ts).TotalMilliseconds}ms");
        return result;
    }
    
    [Test]
    public async Task EqualsTest() => await EvalSingleLine("return object.Equals(null, 1)", "bool");

    [Test]
    public async Task AwaitVoidTest() => await EvalSingleLine("await Task.Delay(500)", "async Task");

    [Test]
    public async Task AwaitResultTest()
    {
        var result = await EvalSingleLine("return await Task.FromResult(123)", "async Task<int>");
        Assert.IsTrue(result.GetInt()!.Value == 123);
    }

    [Test]
    public void ConvertTest()
    {
        var exp = LinqExpression.Parameter(typeof(int));
        var evaluator = new ExpressionEvaluator();
    }
}