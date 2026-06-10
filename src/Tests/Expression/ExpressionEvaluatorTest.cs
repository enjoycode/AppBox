using System.Diagnostics;
using AppBoxCore;
using AppBoxDesign;
using AppBoxDesign.CodeGenerator;
using NUnit.Framework;

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
        var exp = ParseSingleLine(lineCode, returnType);

        var ts = Stopwatch.GetTimestamp();
        var evaluator = new ExpressionEvaluator(ExpressionContext.Default);
        var result = await evaluator.Visit(exp);
        Console.WriteLine($"Eval used: {Stopwatch.GetElapsedTime(ts).TotalMilliseconds}ms");

        assert?.Invoke(result);
    }

    private static Expression ParseSingleLine(string lineCode, string returnType = "void", string parameters = "")
    {
        var code = $$$"""
                      using System;
                      using System.Threading.Tasks;
                      using System.Collections.Generic;
                      static class C{
                        static {{{returnType}}} M({{{parameters}}}){
                            {{{lineCode}}};
                        }
                      }
                      """;

        var ts = Stopwatch.GetTimestamp();
        var exp = ExpressionParser.ParseCode(code, lineCode.StartsWith("return "));
        Console.WriteLine($"Parse used: {Stopwatch.GetElapsedTime(ts).TotalMilliseconds}ms");
        return exp;
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

    [Test]
    public void ParseIndexerTest1()
    {
        var exp = ParseSingleLine("return map[\"key\"]", "int", "Dictionary<string,int> map");
        Assert.IsTrue(exp is IndexExpression);
    }

    [Test]
    public void ParseIndexerTest2()
    {
        var exp = ParseSingleLine("return list[0]", "int", "List<int> list");
        Assert.IsTrue(exp is IndexExpression);
    }

    [Test]
    public void ParseArrayAccessTest()
    {
        var exp = ParseSingleLine("return array[0]", "int", "int[] array");
        Assert.IsTrue(exp is IndexExpression);
    }
}