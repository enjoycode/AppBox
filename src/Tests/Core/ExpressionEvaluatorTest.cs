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

    private static async Task EvalSingleLine(string lineCode, string returnType = "void",
        Func<AnyValue, bool>? assert = null)
    {
        var code =
            $"using System;using System.Threading.Tasks;static class C{{static {returnType} M(){{{lineCode};}}}}";

        var ts = Stopwatch.GetTimestamp();
        var exp = ExpressionParser.ParseCode(code, lineCode.StartsWith("return "));
        Console.WriteLine($"Parse used: {Stopwatch.GetElapsedTime(ts).TotalMilliseconds}ms");

        ts = Stopwatch.GetTimestamp();
        var evaluator = new ExpressionEvaluator(ExpressionContext.Default);
        var result = await evaluator.Visit(exp);
        Console.WriteLine($"Eval used: {Stopwatch.GetElapsedTime(ts).TotalMilliseconds}ms");

        assert?.Invoke(result);
    }

    [Test]
    public Task TestAddWithConverted() => EvalSingleLine("return 1 + 2.5", "double",
        // ReSharper disable once CompareOfFloatsByEqualityOperator
        res => res.GetDouble()!.Value == 1 + 2.5);

    [Test]
    public Task MethoCallTest1() => EvalSingleLine("return object.Equals(null, 1)", "bool",
        res => !res.GetBool()!.Value);

    [Test]
    public Task MethodCallTest2() => EvalSingleLine("return Equals(null, 1)", "bool",
        res => !res.GetBool()!.Value);

    [Test]
    public Task StaticPropertyTest() => EvalSingleLine("return System.DateTime.Now", "DateTime",
        res => res.GetDateTime()!.Value <= DateTime.Now);

    [Test]
    public Task AwaitVoidTest() => EvalSingleLine("await Task.Delay(500)", "async Task");

    [Test]
    public Task AwaitResultTest() => EvalSingleLine("return await Task.FromResult(123)", "async Task<int>",
        res => res.GetInt()!.Value == 123);
}